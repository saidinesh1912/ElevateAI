
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
# 1. RESUME FILE PATH
# ==========================================

RESUME_PATH = r"C:\Users\HP\Downloads\AVSSAIDINESHGIDITURIRESUME (1).pdf"


# ==========================================
# 2. ANALYZE ALL RESUME PROJECTS
# ==========================================

def analyze_resume_projects(resume_path):

    print("\nReading resume...")

    resume_text = extract_resume_text(resume_path)

    print("Resume extracted successfully!")

    print("\nExtracting project sections...")

    sections = extract_project_sections(resume_text)

    print("Project sections found:", len(sections))

    projects = extract_individual_projects(sections)

    if not projects:
        print("No projects found in the resume.")
        return

    print("\nProjects identified:", len(projects))

    # Store AI results from every successfully analyzed project
    all_project_results = []


    # ==========================================
    # 3. ANALYZE EACH PROJECT
    # ==========================================

    for index, project in enumerate(projects, start=1):

        print("\n" + "=" * 60)
        print(f"PROJECT {index}: {project['title']}")
        print("=" * 60)

        description = (
            project["description"]
            + "\nTechnologies: "
            + project["technologies"]
        )

        if not description.strip():
            print("Project description is empty. Skipping.")
            continue

        print("\nSending project to OpenRouter...")

        try:

            result = analyze_project(
                project_title=project["title"],
                project_description=description
            )

            # ==========================================
            # 4. NORMALIZE SKILL NAMES
            # ==========================================

            for key in [
                "explicit_skills",
                "potential_hidden_skills"
            ]:

                for skill in result.get(key, []):

                    skill["skill"] = normalize_skill_name(
                        skill.get("skill", "")
                    )

            # Save this project's analysis
            all_project_results.append(result)

            # ==========================================
            # 5. DISPLAY PROJECT SKILLS
            # ==========================================

            print("\nEXPLICIT SKILLS:")

            for skill in result.get("explicit_skills", []):

                print(
                    f"- {skill.get('skill')} "
                    f"| {skill.get('category')}"
                )

                print(
                    f"  Evidence: {skill.get('evidence')}"
                )

            print("\nPOTENTIAL HIDDEN SKILLS:")

            for skill in result.get("potential_hidden_skills", []):

                print(
                    f"- {skill.get('skill')} "
                    f"| {skill.get('category')}"
                )

                print(
                    f"  Evidence: {skill.get('evidence')}"
                )

                print(
                    f"  Reason: {skill.get('reason')}"
                )

            print("\nPROJECT SUMMARY:")

            print(
                result.get("summary", "Not available")
            )

        except Exception as error:

            print(f"Analysis failed: {error}")


    # ==========================================
    # 6. CONSOLIDATE SKILLS ACROSS PROJECTS
    # ==========================================

    if not all_project_results:

        print("\nNo projects were successfully analyzed.")
        return

    print("\n\n" + "=" * 60)
    print("CONSOLIDATING SKILLS ACROSS PROJECTS")
    print("=" * 60)

    consolidated_skills = consolidate_project_skills(
        all_project_results
    )


    # ==========================================
    # 7. DISPLAY CONSOLIDATED SKILLS
    # ==========================================

    print("\nFINAL CONSOLIDATED SKILLS")

    print("=" * 60)

    for skill in consolidated_skills:

        print(
            f"\nSkill: {skill['skill']}"
        )

        print(
            f"Category: {skill['category']}"
        )

        print(
            f"Status: {skill['status']}"
        )

        print(
            f"Found in {skill['project_count']} project(s)"
        )

        print(
            "Projects: "
            + ", ".join(skill["projects"])
        )

        print("Evidence:")

        for evidence in skill["evidence"]:

            print(
                f"  - [{evidence['project']}] "
                f"{evidence['evidence']}"
            )


    # ==========================================
    # 8. FINAL SUMMARY
    # ==========================================

    explicit_count = sum(
        1 for skill in consolidated_skills
        if skill["status"] == "explicit"
    )

    potential_count = sum(
        1 for skill in consolidated_skills
        if skill["status"] == "potential"
    )

    print("\n\n" + "=" * 60)
    print("SKILL DISCOVERY SUMMARY")
    print("=" * 60)

    print("Projects analyzed:", len(all_project_results))

    print("Total unique skills:", len(consolidated_skills))

    print("Explicit skills:", explicit_count)

    print("Potential hidden skills:", potential_count)

    print("\nResume skill discovery completed successfully!")


# ==========================================
# 9. MAIN EXECUTION
# ==========================================

if __name__ == "__main__":

    analyze_resume_projects(RESUME_PATH)
