import io
import os
import sys
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import httpx
from docx import Document
from fastapi.testclient import TestClient
from pypdf import PdfWriter

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class FakeSupabaseClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        return None

    async def get(self, url, headers):
        return httpx.Response(
            200,
            json={"id": "verified-test-user"},
            request=httpx.Request("GET", url),
        )

    async def post(self, url, json, headers):
        return httpx.Response(
            200,
            json={"result": [0, 60]},
            request=httpx.Request("POST", url),
        )


def make_docx(text="Synthetic resume"):
    content = io.BytesIO()
    document = Document()
    document.add_paragraph(text)
    document.save(content)
    return content.getvalue()


def make_pdf(encrypted=False):
    content = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    if encrypted:
        writer.encrypt("synthetic-test-password")
    writer.write(content)
    return content.getvalue()


class ResumeInputLimitTests(unittest.TestCase):
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
        self.supabase_client = patch("main.httpx.AsyncClient", FakeSupabaseClient)
        self.supabase_client.start()
        self.addCleanup(self.supabase_client.stop)
        self.groq = patch("main.analyze_with_groq")
        self.analyze = self.groq.start()
        self.addCleanup(self.groq.stop)
        self.client = TestClient(main.app)
        self.headers = {"Authorization": "Bearer synthetic-test-token"}

    def upload(self, filename, content, job_role="Software Engineer"):
        return self.client.post(
            "/upload",
            data={"job_role": job_role},
            files={"file": (filename, content, "application/octet-stream")},
            headers=self.headers,
        )

    def match(self, filename, content, job_description="Synthetic job description"):
        return self.client.post(
            "/match",
            data={"job_description": job_description},
            files={"file": (filename, content, "application/octet-stream")},
            headers=self.headers,
        )

    def assert_rejected_without_groq(self, response, status_code):
        self.assertEqual(response.status_code, status_code, response.text)
        self.analyze.assert_not_called()

    def test_oversized_upload_is_rejected_while_reading(self):
        with patch("main.MAX_UPLOAD_SIZE_BYTES", 16):
            response = self.upload("resume.pdf", b"x" * 17)

        self.assert_rejected_without_groq(response, 413)

    def test_unsupported_extension_is_rejected_even_with_pdf_content(self):
        response = self.upload("resume.txt", b"%PDF-1.7 synthetic")

        self.assert_rejected_without_groq(response, 400)

    def test_invalid_pdf_content_is_rejected(self):
        response = self.upload("resume.pdf", b"%PDF-1.7 truncated document")

        self.assert_rejected_without_groq(response, 400)

    def test_invalid_docx_content_is_rejected(self):
        response = self.upload("resume.docx", b"PK\x03\x04not-a-docx-archive")

        self.assert_rejected_without_groq(response, 400)

    def test_docx_uncompressed_size_is_limited(self):
        content = io.BytesIO()
        with zipfile.ZipFile(content, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("[Content_Types].xml", "<Types/>")
            archive.writestr("word/document.xml", "<document/>")
            archive.writestr("word/extra.xml", "x" * 1000)

        with patch("main.MAX_DOCX_UNCOMPRESSED_SIZE_BYTES", 128):
            response = self.upload("resume.docx", content.getvalue())

        self.assert_rejected_without_groq(response, 413)

    def test_encrypted_pdf_is_rejected(self):
        response = self.upload("resume.pdf", make_pdf(encrypted=True))

        self.assert_rejected_without_groq(response, 400)

    def test_valid_docx_text_is_extracted(self):
        text = main.extract_resume_text(
            "resume.docx",
            io.BytesIO(make_docx("Synthetic valid resume text")),
        )

        self.assertEqual(text, "Synthetic valid resume text")

    def test_empty_extracted_text_is_rejected(self):
        response = self.upload("resume.pdf", make_pdf())

        self.assert_rejected_without_groq(response, 400)

    def test_excessive_extracted_text_is_rejected(self):
        with patch("main.MAX_EXTRACTED_TEXT_LENGTH", 16):
            response = self.upload("resume.docx", make_docx("Synthetic text longer than limit"))

        self.assert_rejected_without_groq(response, 413)

    def test_excessive_job_description_is_rejected(self):
        with (
            patch("main.MAX_JOB_DESCRIPTION_LENGTH", 16),
            patch("main.extract_resume_text") as extract,
        ):
            response = self.match(
                "resume.pdf",
                make_pdf(),
                job_description="A job description that exceeds the configured test limit",
            )

        self.assert_rejected_without_groq(response, 413)
        extract.assert_not_called()

    def test_excessive_job_role_is_rejected(self):
        with (
            patch("main.MAX_JOB_ROLE_LENGTH", 16),
            patch("main.extract_resume_text") as extract,
        ):
            response = self.upload(
                "resume.pdf",
                make_pdf(),
                job_role="A target role longer than the configured test limit",
            )

        self.assert_rejected_without_groq(response, 413)
        extract.assert_not_called()

    def test_excessive_improve_text_is_rejected(self):
        with patch("main.MAX_IMPROVE_TEXT_LENGTH", 16):
            response = self.client.post(
                "/improve",
                data={"original_text": "Synthetic text longer than the configured limit"},
                headers=self.headers,
            )

        self.assert_rejected_without_groq(response, 413)


if __name__ == "__main__":
    unittest.main()
