
import re


PROJECT_HEADINGS = {
    "projects",
    "academic projects",
    "personal projects",
    "technical projects",
    "project experience",
    "technical experience",
}

OTHER_SECTION_HEADINGS = {
    "education",
    "internships",
    "experience",
    "work experience",
    "technical skills",
    "skills",
    "certifications",
    "career objective",
    "details",
    "achievements",
    "positions of responsibility",
    "activities",
    "contact",
    "summary",
    "objective",
    "profile",
    "publications",
    "references",
}

# General resume-wide skill information should not be
# included in an individual project's description.
GLOBAL_SKILL_PREFIXES = (
    "core concepts:",
    "web technologies:",
    "databases:",
    "languages:",
    "tools & platforms:",
    "tools and platforms:",
    "programming languages:",
    "technical skills:",
)


def normalize_heading(text):
    text = text.lower().strip()
    text = re.sub(r"[:\-\s]+$", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    return re.sub(r"\s+", " ", text)


def extract_project_sections(resume_text):
    lines = resume_text.splitlines()

    sections = []
    collecting = False
    current_content = []

    for line in lines:
        stripped = line.strip()

        if not stripped:
            continue

        normalized = normalize_heading(stripped)

        if normalized in PROJECT_HEADINGS:

            if collecting and current_content:
                sections.append({
                    "section": "Projects",
                    "content": "\n".join(current_content)
                })

            collecting = True
            current_content = []
            continue

        if normalized in OTHER_SECTION_HEADINGS:

            if collecting and current_content:
                sections.append({
                    "section": "Projects",
                    "content": "\n".join(current_content)
                })

            collecting = False
            current_content = []
            continue

        if collecting:
            current_content.append(stripped)

    if collecting and current_content:
        sections.append({
            "section": "Projects",
            "content": "\n".join(current_content)
        })

    return sections


def extract_individual_projects(project_sections):
    """
    Extract individual project titles, descriptions
    and technology stacks from project sections.
    """

    projects = []
    current_project = None

    for section in project_sections:

        lines = section["content"].splitlines()

        for line in lines:

            stripped = line.strip()

            if not stripped:
                continue

            # Ignore standalone LIVE and DEMO labels
            if stripped.upper() in {"LIVE", "DEMO"}:
                continue

            # Exclude general resume-wide skill information
            if stripped.lower().startswith(GLOBAL_SKILL_PREFIXES):
                continue

            # Detect technology stack lines
            if stripped.lower().startswith(
                ("tools:", "technologies:", "tech stack:")
            ):

                if current_project:
                    current_project["technologies"] = stripped

                continue

            # Remove inline LIVE or DEMO suffixes
            cleaned_title = re.sub(
                r"\s+(LIVE|DEMO)\s*$",
                "",
                stripped,
                flags=re.IGNORECASE
            ).strip()

            # Identify a possible project title
            if current_project is None:

                if not stripped.startswith(("-", "•", "●")):

                    current_project = {
                        "title": cleaned_title,
                        "description": [],
                        "technologies": ""
                    }

                    continue

            # Add remaining lines to the project description
            if current_project:
                current_project["description"].append(stripped)

        if current_project:
            projects.append(current_project)
            current_project = None

    # Convert description lists into strings
    for project in projects:

        project["description"] = " ".join(
            project["description"]
        )

        project["technologies"] = (
            project["technologies"]
            .replace("Tools:", "")
            .replace("Technologies:", "")
            .replace("Tech Stack:", "")
            .strip()
        )

    return projects
