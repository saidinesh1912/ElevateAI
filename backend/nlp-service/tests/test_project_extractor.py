
from resume_parser.text_extractor import extract_resume_text
from resume_parser.project_extractor import (
    extract_project_sections,
    extract_individual_projects
)


RESUME_PATH = r"C:\Users\HP\Downloads\AVSSAIDINESHGIDITURIRESUME (1).pdf"


def test_project_extraction():

    print("\nReading resume...")

    resume_text = extract_resume_text(RESUME_PATH)

    print("Resume text extracted successfully!")

    print("\nIdentifying project sections...")

    sections = extract_project_sections(resume_text)

    print(f"Project sections found: {len(sections)}")

    projects = extract_individual_projects(sections)

    print("\n========== EXTRACTED PROJECTS ==========")

    if not projects:
        print("No projects found.")
        return

    for index, project in enumerate(projects, start=1):

        print(f"\nPROJECT {index}")

        print("Title:", project.get("title", "Not available"))

        print(
            "Technologies:",
            project.get("technologies", "Not available")
        )

        print(
            "Description:",
            project.get("description", "Not available")
        )


if __name__ == "__main__":
    test_project_extraction()
