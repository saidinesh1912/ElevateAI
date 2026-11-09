
import json

from skill_engine.openrouter_service import analyze_project
from skill_engine.skill_normalizer import normalize_skill_name


def test_project_analysis():

    project_title = "AI Study Companion"

    project_description = """
    Developed an AI-powered study application.

    Implemented automated notes generation,
    quiz generation and flashcard creation.

    Integrated conversational AI assistance
    for personalized academic support.

    Built PDF processing functionality to
    extract and analyze learning materials.

    Used Reactjs, Nodejs, Expressjs,
    MongoDB and JavaScript.
    """

    print("\nSending project description to OpenRouter...")

    result = analyze_project(
        project_title,
        project_description
    )

    print("\n========== NORMALIZED AI ANALYSIS ==========")

    for key in ["explicit_skills", "potential_hidden_skills"]:

        for skill in result.get(key, []):
            skill["skill"] = normalize_skill_name(skill["skill"])

    print(json.dumps(result, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    test_project_analysis()
