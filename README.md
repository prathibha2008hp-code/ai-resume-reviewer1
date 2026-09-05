# AI Resume Reviewer

An AI-powered web app that analyzes resumes against a target job role and provides structured feedback: overall score, strengths, weaknesses, missing skills, ATS suggestions, and formatting suggestions.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **AI:** Groq API (Llama 3.3 70B)
- **File parsing:** pypdf, python-docx

## Features
- Upload a resume as PDF or DOCX
- Enter a target job role
- Get AI-generated structured feedback on the resume

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env.example to .env and add your Groq API key
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Status
✅ Core features complete — deployment in progress.