
import os
import pymupdf
from docx import Document


def extract_from_pdf(file_path: str) -> str:
    """Extract text from a PDF resume."""

    text_content = []

    with pymupdf.open(file_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            page_text = page.get_text("text", sort=True)

            if page_text.strip():
                text_content.append(page_text)

    return "\n".join(text_content)


def extract_from_docx(file_path: str) -> str:
    """Extract text from a DOCX resume."""

    document = Document(file_path)
    text_content = []

    # Extract paragraphs
    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text_content.append(paragraph.text)

    # Extract text from tables
    for table in document.tables:
        for row in table.rows:
            row_text = [
                cell.text.strip()
                for cell in row.cells
                if cell.text.strip()
            ]

            if row_text:
                text_content.append(" | ".join(row_text))

    return "\n".join(text_content)


def extract_resume_text(file_path: str) -> str:
    """
    Automatically identify the resume format
    and extract its text.
    """

    if not os.path.isfile(file_path):
        raise FileNotFoundError(
            f"Resume file not found: {file_path}"
        )

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        extracted_text = extract_from_pdf(file_path)

    elif extension == ".docx":
        extracted_text = extract_from_docx(file_path)

    else:
        raise ValueError(
            "Unsupported format. Please upload PDF or DOCX."
        )

    if not extracted_text.strip():
        raise ValueError(
            "No readable text found. The resume may be scanned "
            "or image-based and require OCR."
        )

    return extracted_text
