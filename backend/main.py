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
    allow_origins=[
        "http://localhost:5173",
        "https://ai-resume-reviewer1.vercel.app",
    ],
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
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw_output = response.choices[0].message.content
    analysis = json.loads(raw_output)
    return analysis


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...), job_role: str = Form(...)):
    contents = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from this file.")

    analysis = analyze_resume(text, job_role)

    return {
        "filename": file.filename,
        "job_role": job_role,
        "text_length": len(text),
        "analysis": analysis
    }
def match_job_description(resume_text: str, job_description: str) -> dict:
    prompt = f"""Compare this resume to the job description below.

Resume:
---
{resume_text}
---

Job Description:
---
{job_description}
---

Respond with ONLY a valid JSON object with exactly this structure:
{{
  "match_percentage": <integer 0-100>,
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "recommended_keywords": ["keyword1", "keyword2", ...]
}}
"""
    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return json.loads(response.choices[0].message.content)
def improve_bullet_point(original_text: str) -> str:
    prompt = f"""Rewrite this resume bullet point to be more impactful, using strong action verbs and quantifiable results where reasonable. Return ONLY the improved sentence, nothing else, no quotes.

Original: {original_text}"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()
@app.post("/improve")
async def improve_text(original_text: str = Form(...)):
    improved = improve_bullet_point(original_text)
    return {"original": original_text, "improved": improved}