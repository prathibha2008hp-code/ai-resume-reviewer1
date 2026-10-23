import hashlib
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class FakeRateLimitClient:
    requests = []
    result = [0, 60]
    status_code = 200

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        return None

    async def get(self, url, headers):
        return httpx.Response(
            200,
            json={"id": "server-verified-user"},
            request=httpx.Request("GET", url),
        )

    async def post(self, url, json, headers):
        self.requests.append((url, json, headers))
        return httpx.Response(
            self.status_code,
            json={"result": self.result},
            request=httpx.Request("POST", url),
        )


class DistributedRateLimitTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            os.environ,
            {
                "SUPABASE_URL": "https://project-id.supabase.co",
                "SUPABASE_PUBLISHABLE_KEY": "test-publishable-key",
                "RATE_LIMIT_REDIS_URL": "https://redis.example.test",
                "RATE_LIMIT_REDIS_TOKEN": "test-redis-token",
            },
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)
        FakeRateLimitClient.requests = []
        FakeRateLimitClient.result = [0, 60]
        FakeRateLimitClient.status_code = 200
        self.client_patch = patch("main.httpx.AsyncClient", FakeRateLimitClient)
        self.client_patch.start()
        self.addCleanup(self.client_patch.stop)
        self.analyze_patch = patch("main.analyze_with_groq")
        self.analyze = self.analyze_patch.start()
        self.addCleanup(self.analyze_patch.stop)
        self.client = TestClient(main.app, client=("203.0.113.10", 12345))
        self.headers = {"Authorization": "Bearer synthetic-test-token"}

    def post_endpoint(self, path):
        if path == "/upload":
            return self.client.post(
                path,
                data={"job_role": "Engineer"},
                files={"file": ("resume.pdf", b"synthetic content", "application/pdf")},
                headers=self.headers,
            )
        if path == "/match":
            return self.client.post(
                path,
                data={"job_description": "Engineer role"},
                files={"file": ("resume.pdf", b"synthetic content", "application/pdf")},
                headers=self.headers,
            )
        return self.client.post(
            path,
            data={"original_text": "Synthetic bullet"},
            headers=self.headers,
        )

    def test_rate_limited_responses_reject_all_billable_endpoints(self):
        FakeRateLimitClient.result = [1, 17]
        with patch("main.extract_resume_text", return_value="Synthetic resume"):
            for path in ("/upload", "/match", "/improve"):
                with self.subTest(path=path):
                    response = self.post_endpoint(path)
                    self.assertEqual(response.status_code, 429)
                    self.assertEqual(
                        response.json()["detail"],
                        "AI request limit reached. Please try again later.",
                    )
                    self.assertEqual(response.headers["retry-after"], "17")

        self.analyze.assert_not_called()
        self.assertEqual(len(FakeRateLimitClient.requests), 3)

    def test_distributed_limit_keys_use_verified_user_and_peer_ip_hashes(self):
        FakeRateLimitClient.result = [1, 17]
        with patch("main.extract_resume_text", return_value="Synthetic resume"):
            response = self.post_endpoint("/improve")

        self.assertEqual(response.status_code, 429)
        _, command, headers = FakeRateLimitClient.requests[0]
        self.assertEqual(command[0], "EVAL")
        self.assertEqual(command[2], "2")
        self.assertTrue(command[3].startswith("ai-rate-limit:user:"))
        self.assertTrue(command[4].startswith("ai-rate-limit:ip:"))
        self.assertEqual(
            command[3],
            "ai-rate-limit:user:"
            + hashlib.sha256(b"server-verified-user").hexdigest(),
        )
        self.assertEqual(command[5:], ["60", "10", "30"])
        self.assertEqual(headers["Authorization"], "Bearer test-redis-token")

    def test_spoofed_forwarding_headers_do_not_change_peer_ip_bucket(self):
        FakeRateLimitClient.result = [1, 17]
        response = self.client.post(
            "/improve",
            data={"original_text": "Synthetic bullet"},
            headers={
                **self.headers,
                "X-Forwarded-For": "198.51.100.77, 203.0.113.99",
                "X-Real-IP": "198.51.100.88",
            },
        )

        self.assertEqual(response.status_code, 429)
        _, command, _ = FakeRateLimitClient.requests[0]
        self.assertEqual(
            command[4],
            "ai-rate-limit:ip:"
            + hashlib.sha256(b"203.0.113.10").hexdigest(),
        )
        self.assertNotEqual(
            command[4],
            "ai-rate-limit:ip:"
            + hashlib.sha256(b"198.51.100.77").hexdigest(),
        )
        self.analyze.assert_not_called()

    def test_missing_distributed_store_fails_closed(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("RATE_LIMIT_REDIS_URL", None)
            response = self.post_endpoint("/improve")

        self.assertEqual(response.status_code, 503)
        self.analyze.assert_not_called()
        self.assertEqual(FakeRateLimitClient.requests, [])

    def test_rate_limit_store_failure_fails_closed(self):
        FakeRateLimitClient.status_code = 500
        response = self.post_endpoint("/improve")

        self.assertEqual(response.status_code, 503)
        self.analyze.assert_not_called()


if __name__ == "__main__":
    unittest.main()
