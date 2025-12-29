from pathlib import Path
from pdf2image import convert_from_path
import pytesseract

DPI = 300
OCR_LANG = "eng"
POPPLER_PATH = r"D:\Release-25.12.0-0\poppler-25.12.0\Library\bin"

pdf_path = Path("data/raw/past_papers/2024_Physics_Essay_English.pdf")
out_txt  = Path("data/extracted/past_papers/2024_Physics_Essay_English.txt")

out_txt.parent.mkdir(parents=True, exist_ok=True)

images = convert_from_path(str(pdf_path), dpi=DPI, poppler_path=POPPLER_PATH)

parts = []
for i, img in enumerate(images, start=1):
    txt = pytesseract.image_to_string(img, lang=OCR_LANG)
    parts.append(f"\n\n--- PAGE {i} (OCR) ---\n{txt}")

out_txt.write_text("".join(parts).strip(), encoding="utf-8", errors="ignore")

print("✅ OCR done for 2024 Physics Essay (English)")
