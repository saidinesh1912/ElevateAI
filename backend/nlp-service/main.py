
import os
import shutil
import tempfile

from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser.text_extractor import extract_resume_text
from resume_parser.project_extractor import (
    extract_project_sections,
    extract_individual_projects
)

from skill_engine.openrouter_service import analyze_project

from skill_engine.skill_normalizer import (
    normalize_skill_name,
    consolidate_project_skills
)


# ==========================================
# 1. INITIALIZE FASTAPI
# ==========================================

app = FastAPI(
    title="Elevate AI - Hidden Skill Discovery",
    description="AI-powered resume project and skill analysis API",
    version="1.0.0"
)


# ==========================================
# 2. CORS CONFIGURATION
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
# 3. HEALTH CHECK
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Elevate AI Hidden Skill Discovery API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "hidden-skill-discovery"
    }


# ==========================================
# 4. RESUME ANALYSIS ENDPOINT
# ==========================================

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):

    # Validate file extension
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

        # ======================================
        # SAVE UPLOADED RESUME TEMPORARILY
        # ======================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            shutil.copyfileobj(file.file, temp_file)

            temp_path = temp_file.name

        # ======================================
        # EXTRACT RESUME TEXT
        # ======================================

        resume_text = extract_resume_text(temp_path)

        # ======================================
        # EXTRACT PROJECTS
        # ======================================

        project_sections = extract_project_sections(
            resume_text
        )

        projects = extract_individual_projects(
            project_sections
        )

        if not projects:
            raise HTTPException(
                status_code=422,
                detail="No projects were detected in the uploaded resume."
            )

        # ======================================
        # ANALYZE EACH PROJECT USING OPENROUTER
        # ======================================

        all_project_results = []

        for project in projects:

            description = (
                project["description"]
                + "\nTechnologies: "
                + project["technologies"]
            )

            if not description.strip():
                continue

            result = analyze_project(
                project_title=project["title"],
                project_description=description
            )

            # Normalize skill names
            for key in [
                "explicit_skills",
                "potential_hidden_skills"
            ]:

                for skill in result.get(key, []):

                    skill["skill"] = normalize_skill_name(
                        skill.get("skill", "")
                    )

            all_project_results.append(result)

        if not all_project_results:
            raise HTTPException(
                status_code=422,
                detail="No project could be analyzed."
            )

        # ======================================
        # CONSOLIDATE SKILLS
        # ======================================

        consolidated_skills = consolidate_project_skills(
            all_project_results
        )

        # ======================================
        # FINAL API RESPONSE
        # ======================================

        return {
            "status": "success",
            "filename": file.filename,
            "projects_analyzed": len(all_project_results),
            "total_unique_skills": len(consolidated_skills),

            "projects": all_project_results,

            "consolidated_skills": consolidated_skills
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(error)}"
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()
