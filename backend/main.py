import os
from io import BytesIO
from pathlib import Path
from zipfile import BadZipFile

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import APIError, Groq
from lxml.etree import XMLSyntaxError
from pydantic import BaseModel, Field, ValidationError
from pypdf import PdfReader
from pypdf.errors import PdfReadError

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-resume-reviewer1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "AI Resume Reviewer backend is running!"}


MODEL = "openai/gpt-oss-120b"


class ResumeAnalysis(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    ats_suggestions: list[str]
    formatting_suggestions: list[str]


class JobMatch(BaseModel):
    match_percentage: int = Field(ge=0, le=100)
    matching_skills: list[str]
    missing_skills: list[str]
    recommended_keywords: list[str]


class ImprovedBullet(BaseModel):
    improved: str


def extract_resume_text(filename: str, content: bytes) -> str:
    extension = Path(filename).suffix.lower()
    try:
        if extension == ".pdf":
            text = "\n".join(
                page.extract_text() or "" for page in PdfReader(BytesIO(content)).pages
            )
        elif extension == ".docx":
            document = Document(BytesIO(content))
            paragraphs = [paragraph.text for paragraph in document.paragraphs]
            table_cells = [
                cell.text
                for table in document.tables
                for row in table.rows
                for cell in row.cells
            ]
            text = "\n".join(paragraphs + table_cells)
        else:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are supported.")
    except HTTPException:
        raise
    except (
        BadZipFile,
        KeyError,
        OSError,
        PackageNotFoundError,
        PdfReadError,
        ValueError,
        XMLSyntaxError,
    ) as error:
        raise HTTPException(status_code=400, detail="The uploaded resume could not be read.") from error

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text was found in the resume.")
    return text


def analyze_with_groq(prompt: str, response_model: type[BaseModel]) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="The AI service is not configured.")

    try:
        response = Groq(api_key=api_key).chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert resume reviewer. Return only a valid JSON object "
                        "with exactly the fields and value types requested. Do not use markdown."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
    except APIError as error:
        raise HTTPException(status_code=502, detail="The AI service could not analyze the resume.") from error

    if not response.choices or not response.choices[0].message.content:
        raise HTTPException(status_code=502, detail="The AI service returned an empty response.")

    content = response.choices[0].message.content
    try:
        result = response_model.model_validate_json(content or "")
    except ValidationError as error:
        raise HTTPException(status_code=502, detail="The AI service returned an invalid analysis.") from error
    return result.model_dump()


@app.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_role: str = Form(...),
):
    normalized_job_role = job_role.strip()
    if not normalized_job_role:
        raise HTTPException(status_code=400, detail="Job role is required.")

    resume_text = extract_resume_text(file.filename or "", await file.read())
    analysis = analyze_with_groq(
        "Review this resume for the target role below. Score it from 0 to 100 and "
        "provide concise, actionable lists for strengths, weaknesses, missing_skills, "
        "ats_suggestions, and formatting_suggestions. Return a JSON object with exactly "
        "these keys: overall_score (integer), strengths (array of strings), "
        "weaknesses (array of strings), missing_skills (array of strings), "
        "ats_suggestions (array of strings), formatting_suggestions (array of strings).\n\n"
        f"Target role:\n{normalized_job_role}\n\nResume:\n{resume_text}",
        ResumeAnalysis,
    )
    return {
        "filename": file.filename,
        "job_role": normalized_job_role,
        "text_length": len(resume_text),
        "analysis": analysis,
    }


@app.post("/match")
async def match_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    normalized_job_description = job_description.strip()
    if not normalized_job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    resume_text = extract_resume_text(file.filename or "", await file.read())
    match = analyze_with_groq(
        "Compare the resume to the job description. Estimate match_percentage from 0 to 100 "
        "and list matching_skills, missing_skills, and recommended_keywords as concise arrays "
        "of strings. Return a JSON object with exactly these keys: match_percentage (integer), "
        "matching_skills (array of strings), missing_skills (array of strings), "
        "recommended_keywords (array of strings).\n\n"
        f"Job description:\n{normalized_job_description}\n\nResume:\n{resume_text}",
        JobMatch,
    )
    return match


@app.post("/improve")
async def improve_text(original_text: str = Form(...)):
    improved = analyze_with_groq(
        "Rewrite this resume bullet point to be more impactful, using strong action verbs "
        "and quantifiable results where reasonable. Return a JSON object with exactly this "
        'key: "improved" (string).\n\n'
        f"Original:\n{original_text}",
        ImprovedBullet,
    )
    return {"original": original_text, **improved}
