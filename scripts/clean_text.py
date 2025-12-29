import re
from pathlib import Path
from tqdm import tqdm
import pandas as pd

EXTRACTED_DIR = Path("data/extracted")
CLEANED_DIR = Path("data/cleaned")
MANIFEST_PATH = Path("data/cleaned/_manifest_cleaning.csv")

# --- Tuning knobs ---
MIN_LINE_LEN_TO_JOIN = 55
MAX_HEADER_REPEAT_SCAN = 12


# -------------------------
# Normalization helpers
# -------------------------
def normalize_symbols(text: str) -> str:
    replacements = {
        "\u00d7": " * ",      # ×
        "\u2212": "-",        # −
        "\u03a9": " ohm ",    # Ω
        "\u03bc": " micro ",  # μ
        "\u00b0": " deg ",    # °
        "\u2264": " <= ",     # ≤
        "\u2265": " >= ",     # ≥
    }
    for k, v in replacements.items():
        text = text.replace(k, v)

    text = re.sub(r"[ \t]+", " ", text)
    return text


# -------------------------
# PAGE SPLITTING (FIXED)
# -------------------------
def split_pages(extracted_text: str) -> list[str]:
    """
    Split extracted text into pages.
    Ignores junk text before the first PAGE marker.
    """
    chunks = re.split(
        r"\n\s*---\s*PAGE\s+\d+(?:\s*\(OCR\))?\s*---\s*\n",
        extracted_text
    )

    # If no page markers exist, treat entire text as one page
    if len(chunks) <= 1:
        return [extracted_text.strip()]

    # Ignore chunk before first PAGE marker
    return [c.strip("\n") for c in chunks[1:] if c.strip()]


# -------------------------
# Header / footer detection
# -------------------------
def detect_repeated_header_footer(pages: list[str]) -> tuple[str | None, str | None]:
    scan = pages[: min(len(pages), MAX_HEADER_REPEAT_SCAN)]
    first_lines, last_lines = [], []

    for p in scan:
        lines = [l.strip() for l in p.splitlines() if l.strip()]
        if not lines:
            continue
        first_lines.append(lines[0])
        last_lines.append(lines[-1])

    def most_common(lines: list[str]):
        freq = {}
        for l in lines:
            freq[l] = freq.get(l, 0) + 1
        best = max(freq.items(), key=lambda x: x[1])
        return best[0], best[1] / max(1, len(lines))

    header, h_ratio = most_common(first_lines) if first_lines else (None, 0)
    footer, f_ratio = most_common(last_lines) if last_lines else (None, 0)

    header = header if h_ratio >= 0.6 and len(header) <= 80 else None
    footer = footer if f_ratio >= 0.6 and len(footer) <= 80 else None
    return header, footer


# -------------------------
# Noise removal
# -------------------------
def remove_page_numbers_and_noise_lines(lines: list[str]) -> list[str]:
    cleaned = []
    for l in lines:
        t = l.strip()

        if re.fullmatch(r"\d{1,4}", t):
            continue
        if re.fullmatch(r"[ivxlcdm]{1,8}", t.lower()):
            continue
        if re.fullmatch(r"[-–—_]{3,}", t):
            continue
        if re.fullmatch(r"(page|pg)\s*\d{1,4}", t.lower()):
            continue

        cleaned.append(l)
    return cleaned


# -------------------------
# Line wrapping fix
# -------------------------
def join_wrapped_lines(lines: list[str]) -> list[str]:
    out = []
    i = 0

    while i < len(lines):
        line = lines[i].rstrip()

        if not line.strip():
            out.append("")
            i += 1
            continue

        if i + 1 < len(lines):
            nxt = lines[i + 1].lstrip()
            if nxt.strip():
                ends_ok = line[-1] in ".:;!?)]}"
                starts_mergey = re.match(r"^[a-z0-9(+=\-]", nxt) is not None
                shortish = len(line.strip()) < MIN_LINE_LEN_TO_JOIN

                if (not ends_ok and starts_mergey) or shortish:
                    out.append((line + " " + nxt).strip())
                    i += 2
                    continue

        out.append(line.strip())
        i += 1

    return out


# -------------------------
# Main cleaning pipeline
# -------------------------
def clean_one_extracted(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = normalize_symbols(text)

    pages = split_pages(text)
    header, footer = detect_repeated_header_footer(pages)

    cleaned_pages = []

    for p in pages:
        lines = [l.rstrip() for l in p.splitlines()]

        if header:
            lines = [l for l in lines if l.strip() != header.strip()]
        if footer:
            lines = [l for l in lines if l.strip() != footer.strip()]

        lines = remove_page_numbers_and_noise_lines(lines)
        lines = [re.sub(r"[ \t]+", " ", l).rstrip() for l in lines]
        lines = join_wrapped_lines(lines)

        # collapse excessive blank lines
        tmp, empty_run = [], 0
        for l in lines:
            if not l.strip():
                empty_run += 1
                if empty_run <= 2:
                    tmp.append("")
            else:
                empty_run = 0
                tmp.append(l)

        cleaned_pages.append("\n".join(tmp).strip())

    final = "\n\n=== PAGE BREAK ===\n\n".join(cleaned_pages).strip()
    final = re.sub(r"\n{3,}", "\n\n", final)
    return final


# -------------------------
# Runner
# -------------------------
def main():
    if not EXTRACTED_DIR.exists():
        raise FileNotFoundError(f"Missing: {EXTRACTED_DIR.resolve()}")

    txt_files = sorted(EXTRACTED_DIR.rglob("*.txt"))
    if not txt_files:
        print("No extracted text files found.")
        return

    CLEANED_DIR.mkdir(parents=True, exist_ok=True)
    rows = []

    for in_path in tqdm(txt_files, desc="Cleaning extracted text"):
        rel = in_path.relative_to(EXTRACTED_DIR)
        out_path = CLEANED_DIR / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        raw = in_path.read_text(encoding="utf-8", errors="ignore")
        cleaned = clean_one_extracted(raw)
        out_path.write_text(cleaned, encoding="utf-8", errors="ignore")

        rows.append({
            "in_txt": str(in_path),
            "out_txt": str(out_path),
            "in_chars": len(raw),
            "out_chars": len(cleaned),
        })

    df = pd.DataFrame(rows)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(MANIFEST_PATH, index=False, encoding="utf-8")

    print("\n✅ Cleaning completed")
    print(f"   Files processed : {len(rows)}")
    print(f"   Output folder   : {CLEANED_DIR}")
    print(f"   Manifest        : {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
