
import re


# ==========================================
# 1. SKILL ALIASES
# ==========================================

SKILL_ALIASES = {
    # Frontend
    "reactjs": "React.js",
    "react.js": "React.js",
    "react": "React.js",

    "html5": "HTML",
    "html": "HTML",

    "css3": "CSS",
    "css": "CSS",

    "javascript": "JavaScript",
    "js": "JavaScript",

    "typescript": "TypeScript",
    "ts": "TypeScript",

    # Backend
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",

    "expressjs": "Express.js",
    "express.js": "Express.js",
    "express": "Express.js",

    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",

    # Databases
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",

    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",

    "firebase": "Firebase",
    "firestore": "Firebase Firestore",

    # AI and tools
    "openrouter": "OpenRouter",
    "openai": "OpenAI",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",

    "git": "Git",
    "github": "GitHub",
    "docker": "Docker",
}


# ==========================================
# 2. NORMALIZE ONE SKILL NAME
# ==========================================

def normalize_skill_name(skill: str) -> str:
    """
    Convert different spellings of a skill
    into one standard name.
    """

    if not isinstance(skill, str) or not skill.strip():
        return skill

    normalized = re.sub(
        r"\s+",
        " ",
        skill.lower().strip()
    )

    return SKILL_ALIASES.get(
        normalized,
        skill.strip()
    )


# ==========================================
# 3. NORMALIZE AND REMOVE DUPLICATES
# ==========================================

def normalize_skill_list(skills: list) -> list:
    """
    Normalize skill names and remove duplicates.
    """

    normalized_skills = []
    seen = set()

    for skill in skills:

        normalized = normalize_skill_name(skill)

        if not isinstance(normalized, str) or not normalized.strip():
            continue

        key = normalized.lower()

        if key not in seen:

            normalized_skills.append(normalized)

            seen.add(key)

    return normalized_skills


# ==========================================
# 4. CONSOLIDATE SKILLS ACROSS PROJECTS
# ==========================================

def consolidate_project_skills(project_results: list) -> list:
    """
    Consolidate skills discovered across multiple projects.

    Tracks:
    - Standardized skill name
    - Skill category
    - Evidence
    - Source projects
    - Number of projects demonstrating the skill

    Expected input:
    [
        {
            "project_title": "Study Companion AI",
            "explicit_skills": [...],
            "potential_hidden_skills": [...]
        }
    ]
    """

    consolidated = {}

    for project in project_results:

        project_title = project.get(
            "project_title",
            "Unknown Project"
        )

        skill_groups = [
            ("explicit_skills", "explicit"),
            ("potential_hidden_skills", "potential")
        ]

        for group_name, skill_type in skill_groups:

            skills = project.get(group_name, [])

            for skill_data in skills:

                skill_name = normalize_skill_name(
                    skill_data.get("skill", "")
                )

                if not isinstance(skill_name, str) or not skill_name.strip():
                    continue

                skill_key = skill_name.lower()

                if skill_key not in consolidated:

                    consolidated[skill_key] = {
                        "skill": skill_name,
                        "category": skill_data.get(
                            "category",
                            "Uncategorized"
                        ),
                        "status": skill_type,
                        "evidence": [],
                        "projects": []
                    }

                entry = consolidated[skill_key]

                # Explicit evidence takes priority over potential evidence
                if skill_type == "explicit":
                    entry["status"] = "explicit"

                # Preserve evidence
                evidence_text = skill_data.get("evidence", "")

                evidence_record = {
                    "project": project_title,
                    "type": skill_type,
                    "evidence": evidence_text,
                    "reason": skill_data.get("reason", "")
                }

                if evidence_record not in entry["evidence"]:
                    entry["evidence"].append(evidence_record)

                # Preserve project sources without duplicates
                if project_title not in entry["projects"]:
                    entry["projects"].append(project_title)

    # Convert dictionary into a list
    consolidated_skills = []

    for entry in consolidated.values():

        entry["project_count"] = len(entry["projects"])

        consolidated_skills.append(entry)

    return consolidated_skills
