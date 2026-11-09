
# ==========================================
# ELEVATE AI - JOB ROLE DATABASE
# ==========================================

ROLE_DATABASE = {

    # ======================================
    # 1. FULL STACK DEVELOPER
    # ======================================

    "Full Stack Developer": {
        "description": "Develops both frontend and backend applications.",

        "skills": [
            {"skill": "HTML", "category": "Frontend"},
            {"skill": "CSS", "category": "Frontend"},
            {"skill": "JavaScript", "category": "Programming"},
            {"skill": "React.js", "category": "Frontend"},
            {"skill": "Node.js", "category": "Backend"},
            {"skill": "Express.js", "category": "Backend"},
            {"skill": "REST API", "category": "Backend"},
            {"skill": "MongoDB", "category": "Database"},
            {"skill": "SQL", "category": "Database"},
            {"skill": "Authentication", "category": "Security"},
            {"skill": "Git", "category": "Development Tools"},
            {"skill": "Docker", "category": "DevOps"}
        ]
    },


    # ======================================
    # 2. FRONTEND DEVELOPER
    # ======================================

    "Frontend Developer": {
        "description": "Builds responsive and interactive user interfaces.",

        "skills": [
            {"skill": "HTML", "category": "Frontend"},
            {"skill": "CSS", "category": "Frontend"},
            {"skill": "JavaScript", "category": "Programming"},
            {"skill": "React.js", "category": "Frontend"},
            {"skill": "Responsive Design", "category": "Frontend"},
            {"skill": "REST API", "category": "Integration"},
            {"skill": "Git", "category": "Development Tools"}
        ]
    },


    # ======================================
    # 3. BACKEND DEVELOPER
    # ======================================

    "Backend Developer": {
        "description": "Develops server-side applications and APIs.",

        "skills": [
            {"skill": "JavaScript", "category": "Programming"},
            {"skill": "Node.js", "category": "Backend"},
            {"skill": "Express.js", "category": "Backend"},
            {"skill": "REST API", "category": "Backend"},
            {"skill": "MongoDB", "category": "Database"},
            {"skill": "SQL", "category": "Database"},
            {"skill": "Authentication", "category": "Security"},
            {"skill": "Git", "category": "Development Tools"},
            {"skill": "Docker", "category": "DevOps"}
        ]
    },


    # ======================================
    # 4. PYTHON DEVELOPER
    # ======================================

    "Python Developer": {
        "description": "Builds applications and backend systems using Python.",

        "skills": [
            {"skill": "Python", "category": "Programming"},
            {"skill": "FastAPI", "category": "Backend"},
            {"skill": "Flask", "category": "Backend"},
            {"skill": "Django", "category": "Backend"},
            {"skill": "REST API", "category": "Backend"},
            {"skill": "SQL", "category": "Database"},
            {"skill": "MongoDB", "category": "Database"},
            {"skill": "Git", "category": "Development Tools"},
            {"skill": "Docker", "category": "DevOps"}
        ]
    },


    # ======================================
    # 5. DATA ANALYST
    # ======================================

    "Data Analyst": {
        "description": "Analyzes datasets and creates reports to support decisions.",

        "skills": [
            {"skill": "Python", "category": "Programming"},
            {"skill": "SQL", "category": "Database"},
            {"skill": "Excel", "category": "Data Analysis"},
            {"skill": "Power BI", "category": "Visualization"},
            {"skill": "Pandas", "category": "Data Analysis"},
            {"skill": "NumPy", "category": "Data Analysis"},
            {"skill": "Data Visualization", "category": "Analytics"},
            {"skill": "Statistics", "category": "Mathematics"}
        ]
    },


    # ======================================
    # 6. MACHINE LEARNING ENGINEER
    # ======================================

    "Machine Learning Engineer": {
        "description": "Develops and deploys machine learning models.",

        "skills": [
            {"skill": "Python", "category": "Programming"},
            {"skill": "Machine Learning", "category": "AI/ML"},
            {"skill": "Scikit-learn", "category": "AI/ML"},
            {"skill": "Pandas", "category": "Data Analysis"},
            {"skill": "NumPy", "category": "Data Analysis"},
            {"skill": "TensorFlow", "category": "AI/ML"},
            {"skill": "PyTorch", "category": "AI/ML"},
            {"skill": "Statistics", "category": "Mathematics"},
            {"skill": "Model Evaluation", "category": "AI/ML"}
        ]
    }

}


# ==========================================
# 7. GET ROLE REQUIREMENTS
# ==========================================

def get_role_requirements(role: str):
    """
    Return the required skills for a given job role.
    """

    role_data = ROLE_DATABASE.get(role, {})

    return role_data.get("skills", [])


# ==========================================
# 8. GET ROLE DESCRIPTION
# ==========================================

def get_role_description(role: str):
    """
    Return the description of a job role.
    """

    role_data = ROLE_DATABASE.get(role, {})

    return role_data.get("description", "")


# ==========================================
# 9. GET ALL AVAILABLE ROLES
# ==========================================

def get_all_roles():
    """
    Return all available job role names.
    """

    return list(ROLE_DATABASE.keys())
