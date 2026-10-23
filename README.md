# AI Resume Reviewer

An AI-powered web app that analyzes resumes against a target job role and provides structured feedback: overall score, strengths, weaknesses, missing skills, ATS suggestions, and formatting suggestions.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **AI:** Groq API (`openai/gpt-oss-120b`)
- **File parsing:** pypdf, python-docx

## Features
- Upload a resume as PDF or DOCX
- Enter a target job role
- Get AI-generated structured feedback on the resume

## Running Locally

### Environment Variables

Configure these variables in the deployment dashboards; do not commit actual values:

| Platform | Variable | Purpose |
| --- | --- | --- |
| Render | `GROQ_API_KEY` | Server-side Groq API key |
| Render | `SUPABASE_URL` | Supabase project URL used by the backend to verify access tokens |
| Render | `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used for Auth verification; never use a service-role key |
| Render | `MAX_UPLOAD_SIZE_BYTES` | Maximum upload size in bytes (default: `5242880`, 5 MiB) |
| Render | `MAX_EXTRACTED_TEXT_LENGTH` | Maximum extracted resume text in characters (default: `100000`) |
| Render | `MAX_JOB_DESCRIPTION_LENGTH` | Maximum job description in characters (default: `20000`) |
| Render | `MAX_IMPROVE_TEXT_LENGTH` | Maximum text-to-improve input in characters (default: `10000`) |
| Render | `MAX_JOB_ROLE_LENGTH` | Maximum target job role in characters (default: `200`) |
| Render | `MAX_DOCX_UNCOMPRESSED_SIZE_BYTES` | Maximum total uncompressed DOCX archive size (default: `26214400`, 25 MiB) |
| Render | `RATE_LIMIT_REDIS_URL` | HTTPS REST endpoint for a shared Upstash Redis database |
| Render | `RATE_LIMIT_REDIS_TOKEN` | Upstash Redis REST token; keep secret and configure only on Render |
| Render | `AI_RATE_LIMIT_WINDOW_SECONDS` | Distributed fixed-window duration (default: `60`) |
| Render | `AI_RATE_LIMIT_USER_REQUESTS` | Maximum AI requests per verified Supabase user per window (default: `10`) |
| Render | `AI_RATE_LIMIT_IP_REQUESTS` | Maximum AI requests per client IP per window (default: `30`) |
| Vercel | `VITE_API_URL` | Deployed FastAPI base URL, without a trailing slash |
| Vercel | `VITE_SUPABASE_URL` | The same Supabase project URL |
| Vercel | `VITE_SUPABASE_PUBLISHABLE_KEY` | The same Supabase publishable key; this is public client configuration |

Set the Render Supabase values and the Vercel Supabase values to the same project. Supabase Auth verifies the bearer token through that project's `/auth/v1/user` endpoint; the backend does not decode JWTs or require a JWT signing secret. The frontend must never contain `GROQ_API_KEY` or a Supabase service-role key.

All backend limits must be positive integers. The backend enforces the upload byte limit while reading the uploaded file, then validates the filename extension and PDF/DOCX content before extracting text or calling Groq. Password-protected documents are not accepted.

The three billable endpoints use a shared Upstash Redis REST store for atomic per-user and per-IP rate limits. Configure the HTTPS REST URL and token in Render before enabling these endpoints; requests fail closed with HTTP 503 if the store is missing or unavailable, and return HTTP 429 when a configured limit is exceeded. Limits apply across Render workers and instances sharing that Redis database. IP limits use the connection peer address; confirm the Render/Uvicorn proxy configuration provides the intended client IP and do not trust arbitrary client-supplied forwarding headers. No process-local fallback is used.

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env.example to .env and set the Groq and Supabase values
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