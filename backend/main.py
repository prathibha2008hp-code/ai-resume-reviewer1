from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from docx import Document
from dotenv import load_dotenv
from groq import Groq
import io
import os
import json

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Resume Reviewer backend is running!"}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
    return text


def analyze_resume(resume_text: str, job_role: str) -> dict:
    prompt = f"""You are an expert resume reviewer and ATS (Applicant Tracking System) specialist.

Analyze the following resume for someone targeting this job role: "{job_role}"

Resume text:
---
{resume_text}
---

Respond with ONLY a valid JSON object (no extra text, no markdown formatting) with exactly this structure:
{{
  "overall_score": <integer from 0 to 100>,
  "strengths": ["point 1", "point 2", ...],
  "weaknesses": ["point 1", "point 2", ...],
  "missing_skills": ["skill 1", "skill 2", ...],
  "ats_suggestions": ["suggestion 1", "suggestion 2", ...],
  "formatting_suggestions": ["suggestion 1", "suggestion 2", ...]
}}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw_output = response.choices[0].message.content