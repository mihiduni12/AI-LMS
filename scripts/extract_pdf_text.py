# import os
# from pathlib import Path

# import pandas as pd
# from tqdm import tqdm

# # Primary extractor
# import pdfplumber

# # Fallback extractor (for scanned/odd PDFs)
# import fitz  # PyMuPDF


# RAW_DIR = Path("data/raw")
# OUT_DIR = Path("data/extracted")
# MANIFEST_PATH = Path("data/extracted/_manifest_extraction.csv")

# PDF_EXTS = {".pdf"}


# def extract_with_pdfplumber(pdf_path: Path) -> str:
#     text_parts = []
#     with pdfplumber.open(str(pdf_path)) as pdf:
#         for i, page in enumerate(pdf.pages, start=1):
#             page_text = page.extract_text() or ""
#             # Keep page boundaries (helps debugging later)
#             if page_text.strip():
#                 text_parts.append(f"\n\n--- PAGE {i} ---\n{page_text}")
#             else:
#                 text_parts.append(f"\n\n--- PAGE {i} ---\n")
#     return "".join(text_parts).strip()


# def extract_with_pymupdf(pdf_path: Path) -> str:
#     doc = fitz.open(str(pdf_path))
#     text_parts = []
#     for i in range(doc.page_count):
#         page = doc.load_page(i)
#         page_text = page.get_text("text") or ""
#         if page_text.strip():
#             text_parts.append(f"\n\n--- PAGE {i+1} ---\n{page_text}")
#         else:
#             text_parts.append(f"\n\n--- PAGE {i+1} ---\n")
#     doc.close()
#     return "".join(text_parts).strip()


# def ensure_parent_dir(path: Path):
#     path.parent.mkdir(parents=True, exist_ok=True)


# def list_pdfs(base_dir: Path):
#     pdf_files = []
#     for root, _, files in os.walk(base_dir):
#         for f in files:
#             if Path(f).suffix.lower() in PDF_EXTS:
#                 pdf_files.append(Path(root) / f)
#     return sorted(pdf_files)


# def main():
#     if not RAW_DIR.exists():
#         raise FileNotFoundError(f"RAW_DIR not found: {RAW_DIR.resolve()}")

#     pdf_files = list_pdfs(RAW_DIR)
#     if not pdf_files:
#         print("No PDFs found under data/raw/. Nothing to extract.")
#         return

#     rows = []
#     OUT_DIR.mkdir(parents=True, exist_ok=True)

#     for pdf_path in tqdm(pdf_files, desc="Extracting PDFs"):
#         rel = pdf_path.relative_to(RAW_DIR)  # keep folder structure
#         out_txt = OUT_DIR / rel.with_suffix(".txt")

#         status = "ok"
#         method = "pdfplumber"
#         err = ""

#         try:
#             text = extract_with_pdfplumber(pdf_path)

#             # If too little extracted text, try fallback
#             if len(text.strip()) < 20:
#                 method = "pymupdf_fallback"
#                 text = extract_with_pymupdf(pdf_path)

#             ensure_parent_dir(out_txt)
#             out_txt.write_text(text, encoding="utf-8", errors="ignore")

#         except Exception as e:
#             status = "failed"
#             err = f"{type(e).__name__}: {e}"

#             ensure_parent_dir(out_txt)
#             out_txt.write_text("", encoding="utf-8", errors="ignore")

#             print(f"\n[FAILED] {pdf_path}\n{err}\n")

#         rows.append({
#             "pdf_path": str(pdf_path.as_posix()),
#             "txt_path": str(out_txt.as_posix()),
#             "status": status,
#             "method": method,
#             "error": err
#         })

#     df = pd.DataFrame(rows)
#     ensure_parent_dir(MANIFEST_PATH)
#     df.to_csv(MANIFEST_PATH, index=False, encoding="utf-8")

#     ok_count = int((df["status"] == "ok").sum())
#     fail_count = int((df["status"] == "failed").sum())

#     print("\n✅ Extraction completed.")
#     print(f"   PDFs total : {len(df)}")
#     print(f"   Success   : {ok_count}")
#     print(f"   Failed    : {fail_count}")
#     print(f"   Manifest  : {MANIFEST_PATH.as_posix()}")
#     print(f"   Output    : {OUT_DIR.as_posix()}")


# if __name__ == "__main__":
#     main()
