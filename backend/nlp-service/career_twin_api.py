
import os
import json
import shutil
import tempfile

from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser.text_extractor import extract_resume_text


# ==========================================
# 1. LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv(
    Path(__file__).resolve().parent.parent / ".env"
)

CAREER_API_KEY = os.getenv("CAREER_OPENROUTER_API_KEY")

CAREER_MODEL = os.getenv(
    "CAREER_OPENROUTER_MODEL",
    "openai/gpt-4o-mini"
)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


# ==========================================
# 2. INITIALIZE FASTAPI
# ==========================================

app = FastAPI(
    title="Elevate AI - Career Digital Twin",
    description="AI-powered resume-based career matching API",
    version="1.0.0"
)


# ==========================================
# 3. CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# 4. HEALTH CHECK
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Elevate AI Career Digital Twin API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "career-digital-twin"
    }


# ==========================================
# 5. CAREER ANALYSIS FUNCTION
# ==========================================

def analyze_career_profile(resume_text):

    if not CAREER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Career Twin OpenRouter API key is not configured."
        )

    prompt = f"""
You are an AI-powered career matching assistant.

Analyze the student's resume and identify suitable career paths.

RESUME CONTENT:
{resume_text[:18000]}

TASK:

1. Identify the student's technical skills.
2. Analyze their projects, internships and experience.
3. Identify 3 to 5 suitable career roles.
4. Assign a career suitability score from 0 to 100.
5. Explain why each career matches the student's profile.
6. List the skills supporting each career match.

IMPORTANT RULES:

- Only use information supported by the resume.
- Never invent skills or experience.
- Do not treat missing information as a lack of ability.
- Scores are AI-estimated suitability scores, not probabilities.
- Avoid giving every career an artificially high score.
- Return valid JSON only.
- Do not use Markdown code fences.

REQUIRED JSON FORMAT:

{{
    "identified_skills": [
        "React.js",
        "Node.js"
    ],
    "career_matches": [
        {{
            "career": "Full Stack Developer",
            "match_percentage": 88,
            "reason": "Explanation based on resume evidence",
            "matching_skills": [
                "React.js",
                "Node.js"
            ]
        }}
    ]
}}
"""

    try:

        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {CAREER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Elevate AI Career Digital Twin"
            },
            json={
                "model": CAREER_MODEL,
                "temperature": 0.2,
                "response_format": {
                    "type": "json_object"
                },
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a resume-based career matching assistant. Return valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            },
            timeout=90
        )

        response.raise_for_status()

        data = response.json()

        content = data["choices"][0]["message"]["content"]

        result = json.loads(content)

        matches = result.get("career_matches")

        if not isinstance(matches, list) or not matches:
            raise ValueError("No career matches were returned.")

        for match in matches:

            score = match.get("match_percentage")

            if (
                not isinstance(score, (int, float))
                or isinstance(score, bool)
                or not 0 <= score <= 100
            ):
                raise ValueError("Invalid career suitability score.")

            if not isinstance(match.get("career"), str):
                raise ValueError("Invalid career title.")

            if not isinstance(match.get("reason"), str):
                raise ValueError("Invalid career explanation.")

            if not isinstance(match.get("matching_skills"), list):
                raise ValueError("Invalid matching skills.")

        return result

    except requests.RequestException as error:
        print("OpenRouter error:", error)

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the Career Twin AI service."
        )

    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as error:
        print("Career analysis response error:", error)

        raise HTTPException(
            status_code=502,
            detail="The AI service returned an invalid career analysis."
        )


# ==========================================
# 6. RESUME ANALYSIS ENDPOINT
# ==========================================

@app.post("/api/career-twin/analyze")
async def analyze_resume(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            shutil.copyfileobj(file.file, temp_file)

            temp_path = temp_file.name

        resume_text = extract_resume_text(temp_path)

        result = analyze_career_profile(resume_text)

        return {
            "status": "success",
            "filename": file.filename,
            "career_matches": result["career_matches"],
            "identified_skills": result.get(
                "identified_skills", []
            )
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception as error:
        print("Career Twin error:", error)

        raise HTTPException(
            status_code=500,
            detail="Career analysis failed."
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()

