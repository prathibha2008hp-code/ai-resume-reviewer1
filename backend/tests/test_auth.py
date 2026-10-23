import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class FakeSupabaseClient:
    requests = []
    token_statuses = {}

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        return None

    async def get(self, url, headers):
        self.requests.append((url, headers))
        token = headers["Authorization"].partition(" ")[2]
        status_code = self.token_statuses.get(token, 200)
        body = {"id": "verified-user-id"} if status_code == 200 else {"message": "Invalid token"}
        return httpx.Response(
            status_code,
            json=body,
            request=httpx.Request("GET", url),
        )

    async def post(self, url, json, headers):
        return httpx.Response(
            200,
            json={"result": [0, 60]},
            request=httpx.Request("POST", url),
        )


class SupabaseAuthDependencyTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            "os.environ",
            {
                "SUPABASE_URL": "https://project-id.supabase.co",
                "SUPABASE_PUBLISHABLE_KEY": "test-publishable-key",
                "RATE_LIMIT_REDIS_URL": "https://redis.example.test",
                "RATE_LIMIT_REDIS_TOKEN": "test-redis-token",
            },
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

        FakeSupabaseClient.requests = []
        FakeSupabaseClient.token_statuses = {}
        self.supabase_client = patch("main.httpx.AsyncClient", FakeSupabaseClient)
        self.supabase_client.start()
        self.addCleanup(self.supabase_client.stop)
        self.client = TestClient(main.app)

    def post_ai_endpoint(self, path, headers=None):
        if path == "/upload":
            return self.client.post(
                path,
                data={"job_role": "Software Engineer"},
                files={"file": ("resume.pdf", b"synthetic test document", "application/pdf")},
                headers=headers,
            )
        if path == "/match":
            return self.client.post(
                path,
                data={"job_description": "Software Engineer"},
                files={"file": ("resume.pdf", b"synthetic test document", "application/pdf")},
                headers=headers,
            )
        return self.client.post(
            path,
            data={"original_text": "Synthetic test bullet"},
            headers=headers,
        )

    def test_missing_token_is_rejected_on_all_ai_endpoints(self):
        with patch("main.analyze_with_groq") as analyze:
            for path in ("/upload", "/match", "/improve"):
                with self.subTest(path=path):
                    response = self.post_ai_endpoint(path)
                    self.assertEqual(response.status_code, 401)
                    self.assertEqual(response.json()["detail"], "Authentication required.")
                    self.assertEqual(response.headers["www-authenticate"], "Bearer")

        self.assertEqual(FakeSupabaseClient.requests, [])
        analyze.assert_not_called()

    def test_invalid_token_is_rejected(self):
        FakeSupabaseClient.token_statuses["invalid-test-token"] = 401
        with patch("main.analyze_with_groq") as analyze:
            response = self.post_ai_endpoint(
                "/improve",
                headers={"Authorization": "Bearer invalid-test-token"},
            )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Authentication required.")
        analyze.assert_not_called()

    def test_expired_token_is_rejected(self):
        FakeSupabaseClient.token_statuses["expired-test-token"] = 401
        with patch("main.analyze_with_groq") as analyze:
            response = self.post_ai_endpoint(
                "/improve",
                headers={"Authorization": "Bearer expired-test-token"},
            )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Authentication required.")
        analyze.assert_not_called()

    def test_valid_supabase_user_can_call_all_ai_endpoints(self):
        def analyze(prompt, response_model):
            if response_model is main.ResumeAnalysis:
                return {
                    "overall_score": 80,
                    "strengths": [],
                    "weaknesses": [],
                    "missing_skills": [],
                    "ats_suggestions": [],
                    "formatting_suggestions": [],
                }
            if response_model is main.JobMatch:
                return {
                    "match_percentage": 75,
                    "matching_skills": [],
                    "missing_skills": [],
                    "recommended_keywords": [],
                }
            return {"improved": "Synthetic improved bullet"}

        headers = {"Authorization": "Bearer valid-test-token"}
        with (
            patch("main.extract_resume_text", return_value="Synthetic resume text"),
            patch("main.analyze_with_groq", side_effect=analyze) as analyze_mock,
        ):
            upload = self.post_ai_endpoint("/upload", headers)
            match = self.post_ai_endpoint("/match", headers)
            improve = self.post_ai_endpoint("/improve", headers)

        self.assertEqual(upload.status_code, 200)
        self.assertEqual(upload.json()["analysis"]["overall_score"], 80)
        self.assertEqual(match.status_code, 200)
        self.assertEqual(match.json()["match_percentage"], 75)
        self.assertEqual(improve.status_code, 200)
        self.assertEqual(improve.json()["improved"], "Synthetic improved bullet")
        self.assertEqual(analyze_mock.call_count, 3)
        self.assertEqual(len(FakeSupabaseClient.requests), 3)
        for url, request_headers in FakeSupabaseClient.requests:
            self.assertEqual(url, "https://project-id.supabase.co/auth/v1/user")
            self.assertEqual(request_headers["apikey"], "test-publishable-key")
            self.assertEqual(
                request_headers["Authorization"],
                "Bearer valid-test-token",
            )


if __name__ == "__main__":
    unittest.main()
