import os
import re
from pathlib import Path

import pandas as pd
from tqdm import tqdm

import pdfplumber
import pytesseract
from pdf2image import convert_from_path


RAW_DIR = Path("data/raw")
OUT_DIR = Path("data/extracted")
MANIFEST_PATH = Path("data/extracted/_manifest_hybrid_ocr.csv")

PDF_EXTS = {".pdf"}

# OCR settings
OCR_LANG = "eng"
DPI = 300

# If Poppler isn't in PATH, set this:
POPPLER_PATH = r"D:\Release-25.12.0-0\poppler-25.12.0\Library\bin"

# Optional: If Tesseract isn't in PATH, set this:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def ensure_parent_dir(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


def list_pdfs(base_dir: Path):
    pdf_files = []
    for root, _, files in os.walk(base_dir):
        for f in files:
            if Path(f).suffix.lower() in PDF_EXTS:
                pdf_files.append(Path(root) / f)
    return sorted(pdf_files)


def normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def page_looks_junk_or_empty(page_text: str) -> bool:
    """
    Decide if a single page needs OCR.
    We avoid using too-high thresholds; this is page-level.
    """
    t = (page_text or "").strip()
    if len(t) < 40:
        return True

    # Remove our own markers if any
    t2 = "\n".join([ln for ln in t.splitlines() if not ln.strip().startswith("--- PAGE")]).strip()
    if len(t2) < 40:
        return True

    # If very few alphabetic characters, it's probably junk (headers, dots, symbols)
    letters = sum(ch.isalpha() for ch in t2)
    ratio_letters = letters / max(1, len(t2))
    if ratio_letters < 0.12 and len(t2) < 400:
        return True

    # Detect classic OCR garbage patterns: many repeated same chars / weird blocks
    # (OWWODODO..., PH9H0HHH..., etc.)
    collapsed = normalize_ws(t2)
    if len(collapsed) > 60:
        # Long runs of the same character
        if re.search(r"(.)\1\1\1\1\1", collapsed):
            return True
        # Too many non-alnum chars
        non_alnum = sum(not c.isalnum() and not c.isspace() for c in collapsed)
        if non_alnum / max(1, len(collapsed)) > 0.35:
            return True

    return False


def ocr_single_page(pdf_path: Path, page_num_1based: int) -> str:
    """
    OCR a single page (1-based page number) using pdf2image.
    """
    images = convert_from_path(
        str(pdf_path),
        dpi=DPI,
        poppler_path=POPPLER_PATH,
        first_page=page_num_1based,
        last_page=page_num_1based,
    )
    if not images:
        return ""

    img = images[0]
    return pytesseract.image_to_string(img, lang=OCR_LANG) or ""


def hybrid_extract_pdf(pdf_path: Path):
    """
    Returns:
      full_text, total_pages, pages_ocr_count
    """
    parts = []
    pages_ocr = 0

    with pdfplumber.open(str(pdf_path)) as pdf:
        total_pages = len(pdf.pages)

        for i, page in enumerate(pdf.pages, start=1):
            extracted = page.extract_text() or ""
            if page_looks_junk_or_empty(extracted):
                ocr_txt = ocr_single_page(pdf_path, i)
                pages_ocr += 1
                parts.append(f"\n\n--- PAGE {i} (OCR) ---\n{ocr_txt}")
            else:
                parts.append(f"\n\n--- PAGE {i} ---\n{extracted}")

    return "".join(parts).strip(), total_pages, pages_ocr


def main():
    if not RAW_DIR.exists():
        raise FileNotFoundError(f"RAW_DIR not found: {RAW_DIR.resolve()}")

    pdf_files = list_pdfs(RAW_DIR)
    if not pdf_files:
        print("No PDFs found under data/raw/. Nothing to process.")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    for pdf_path in tqdm(pdf_files, desc="Hybrid extract (OCR only junk pages)"):
        rel = pdf_path.relative_to(RAW_DIR)
        out_txt = OUT_DIR / rel.with_suffix(".txt")
        ensure_parent_dir(out_txt)

        status = "ok"
        err = ""
        total_pages = 0
        pages_ocr = 0

        try:
            text, total_pages, pages_ocr = hybrid_extract_pdf(pdf_path)
            out_txt.write_text(text, encoding="utf-8", errors="ignore")

        except Exception as e:
            status = "failed"
            err = f"{type(e).__name__}: {e}"
            out_txt.write_text("", encoding="utf-8", errors="ignore")
            print(f"\n[FAILED] {pdf_path}\n{err}\n")

        rows.append({
            "pdf_path": str(pdf_path.as_posix()),
            "txt_path": str(out_txt.as_posix()),
            "status": status,
            "total_pages": total_pages,
            "pages_ocr": pages_ocr,
            "error": err
        })

    df = pd.DataFrame(rows)
    ensure_parent_dir(MANIFEST_PATH)
    df.to_csv(MANIFEST_PATH, index=False, encoding="utf-8")

    ok_count = int((df["status"] == "ok").sum())
    fail_count = int((df["status"] == "failed").sum())

    print("\n✅ Hybrid extraction completed.")
    print(f"   PDFs total : {len(df)}")
    print(f"   Success   : {ok_count}")
    print(f"   Failed    : {fail_count}")
    print(f"   Manifest  : {MANIFEST_PATH.as_posix()}")
    print(f"   Output    : {OUT_DIR.as_posix()}")
    print("\nTip: Check the manifest 'pages_ocr' column to see which PDFs needed OCR.")


if __name__ == "__main__":
    main()
