# from pathlib import Path

# from tqdm import tqdm
# import pytesseract
# from pdf2image import convert_from_path


# RAW_DIR = Path("data/raw")
# OUT_DIR = Path("data/extracted")

# OCR_LANG = "eng"   # English only
# DPI = 300          # good quality for papers

# # If Poppler isn't in PATH, set this:
# POPPLER_PATH = r"D:\Release-25.12.0-0\poppler-25.12.0\Library\bin"


# def looks_empty(text: str) -> bool:
#     """
#     True if extracted text is likely unusable:
#     - too short, OR
#     - mostly just page markers with very little real content
#     """
#     t = (text or "").strip()
#     if len(t) < 1200:
#         return True

#     lines = [x.strip() for x in t.splitlines() if x.strip()]
#     content_lines = [l for l in lines if not l.startswith("--- PAGE")]

#     if len(content_lines) < 30:
#         return True

#     return False


# def ocr_pdf_to_text(pdf_path: Path) -> str:
#     images = convert_from_path(
#         str(pdf_path),
#         dpi=DPI,
#         poppler_path=POPPLER_PATH
#     )

#     parts = []
#     for i, img in enumerate(images, start=1):
#         txt = pytesseract.image_to_string(img, lang=OCR_LANG)
#         parts.append(f"\n\n--- PAGE {i} (OCR) ---\n{txt}")

#     return "".join(parts).strip()


# def main():
#     pdfs = list(RAW_DIR.rglob("*.pdf"))
#     if not pdfs:
#         print("No PDFs found in data/raw/")
#         return

#     for pdf_path in tqdm(pdfs, desc="OCR (only empty/junk extracted files)"):
#         rel = pdf_path.relative_to(RAW_DIR)
#         out_txt = OUT_DIR / rel.with_suffix(".txt")
#         out_txt.parent.mkdir(parents=True, exist_ok=True)

#         # Only OCR if current extracted text is empty/junk
#         if out_txt.exists():
#             existing = out_txt.read_text(encoding="utf-8", errors="ignore")
#             if not looks_empty(existing):
#                 continue

#         text = ocr_pdf_to_text(pdf_path)
#         out_txt.write_text(text, encoding="utf-8", errors="ignore")

#     print("✅ OCR finished. Check data/extracted/** for real text.")


# if __name__ == "__main__":
#     main()
