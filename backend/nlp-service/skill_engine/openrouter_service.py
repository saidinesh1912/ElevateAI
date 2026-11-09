
import os
import json
import requests

from pathlib import Path
from dotenv import load_dotenv


# ==========================================
# 1. LOAD ENVIRONMENT VARIABLES
# ==========================================

# Locate backend/.env automatically
BACKEND_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(BACKEND_ENV_PATH)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_NAME = "openai/gpt-4o-mini"


# ==========================================
# 2. ANALYZE PROJECT USING OPENROUTER
# ==========================================

def analyze_project(project_title: str, project_description: str):
    """
    Analyze a student project using OpenRouter AI.

    Identifies:
    1. Explicit skills
    2. Potential hidden skills
    3. Supporting evidence
    4. Skill categories
    5. Project summary
    """

    # Validate API key
    if not OPENROUTER_API_KEY:
        raise ValueError(
            "OPENROUTER_API_KEY not found. Check backend/.env"
        )

    # Validate project title
    if not isinstance(project_title, str) or not project_title.strip():
        raise ValueError("Project title cannot be empty.")

    # Validate project description
    if not isinstance(project_description, str) or not project_description.strip():
        raise ValueError("Project description cannot be empty.")

    # ==========================================
    # 3. AI PROMPT
    # ==========================================

    prompt = f"""
You are a strict technical skill analyst for a student career guidance platform.

Analyze the following student project.

PROJECT TITLE:
{project_title}

PROJECT DESCRIPTION:
{project_description}

Your task is to identify technical skills demonstrated by this project.

1. EXPLICIT SKILLS:
Identify technologies, programming languages, frameworks,
databases, and technical skills directly mentioned in the description.

2. POTENTIAL HIDDEN SKILLS:
Identify additional skills only when the implementation provides
clear technical evidence that the student may have used them.

3. EVIDENCE:
For every skill, quote or accurately reference the relevant project
description. Never create evidence that is not present.

4. CATEGORY:
Assign a suitable technical category to every skill.

STRICT ANALYSIS RULES:

- Never invent technologies, tools, frameworks, or experience.
- A skill explicitly mentioned in the technology stack is explicit.
- A feature alone does not prove a specific technical skill.
- Generating quizzes does NOT demonstrate automated testing.
- Generating notes does NOT automatically demonstrate NLP.
- Using conversational AI does not prove that the student
  implemented NLP algorithms.
- PDF extraction may demonstrate data extraction or document
  processing, but does not automatically prove advanced data science.
- Do not infer advanced expertise from basic implementation.
- Do not repeat the same skill in both categories.
- If evidence is insufficient, omit the skill.
- Potential hidden skills must be marked as potential, not confirmed.
- Prefer fewer accurate skills over many speculative skills.
- Do not claim that a student used a particular library or algorithm
  unless it is explicitly supported by the description.
- Do not treat ordinary application features as proof of testing,
  security, deployment, scalability, or software architecture skills.

Return valid JSON only, without Markdown code fences.

Use exactly this JSON structure:

{{
    "project_title": "{project_title}",
    "explicit_skills": [
        {{
            "skill": "React.js",
            "category": "Frontend Development",
            "evidence": "Direct evidence from the project description"
        }}
    ],
    "potential_hidden_skills": [
        {{
            "skill": "Document Processing",
            "category": "Data Processing",
            "evidence": "Relevant implementation evidence",
            "reason": "Why this implementation may demonstrate the skill"
        }}
    ],
    "summary": "A concise summary of the project's technical capabilities."
}}
"""

    # ==========================================
    # 4. OPENROUTER API HEADERS
    # ==========================================

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Elevate AI"
    }

    # ==========================================
    # 5. API REQUEST PAYLOAD
    # ==========================================

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1500
    }

    # ==========================================
    # 6. SEND REQUEST TO OPENROUTER
    # ==========================================

    try:

        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        result = response.json()

        ai_content = result["choices"][0]["message"]["content"]

        if not ai_content:
            raise ValueError(
                "OpenRouter returned an empty response."
            )

        # ==========================================
        # 7. CLEAN AI RESPONSE
        # ==========================================

        ai_content = ai_content.strip()

        # Remove Markdown code fences if present
        if ai_content.startswith("```"):

            ai_content = ai_content.split("\n", 1)[1]

            ai_content = ai_content.rsplit("```", 1)[0].strip()

        # ==========================================
        # 8. VALIDATE JSON RESPONSE
        # ==========================================

        parsed_result = json.loads(ai_content)

        # Validate required response structure
        required_keys = [
            "project_title",
            "explicit_skills",
            "potential_hidden_skills",
            "summary"
        ]

        for key in required_keys:
            if key not in parsed_result:
                raise ValueError(
                    f"Missing required field in AI response: {key}"
                )

        if not isinstance(parsed_result["explicit_skills"], list):
            raise ValueError("explicit_skills must be a list.")

        if not isinstance(parsed_result["potential_hidden_skills"], list):
            raise ValueError("potential_hidden_skills must be a list.")

        return parsed_result

    # ==========================================
    # 9. ERROR HANDLING
    # ==========================================

    except requests.exceptions.HTTPError as error:

        raise RuntimeError(
            f"OpenRouter API error: {response.status_code} - "
            f"{response.text[:1000]}"
        ) from error

    except requests.exceptions.RequestException as error:

        raise RuntimeError(
            f"Could not connect to OpenRouter: {error}"
        ) from error

    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as error:

        raise RuntimeError(
            "Invalid or unexpected response received from OpenRouter."
        ) from error
