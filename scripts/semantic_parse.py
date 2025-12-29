import json
import re
from pathlib import Path
from tqdm import tqdm
import pandas as pd

CLEANED_DIR = Path("data/cleaned")
PARSED_DIR = Path("data/parsed")
MANIFEST_PATH = Path("data/parsed/_manifest_parsed.csv")

# ---- Keyword cues for doc type detection (edit later as your corpus grows) ----
TYPE_RULES = [
    ("marking_schemes", ["marking scheme", "scheme of marking", "marks", "allocation"]),
    ("past_papers", ["time allowed", "answer all questions", "instructions to candidates", "paper", "section a", "section b"]),
    ("teachers_guide", ["teacher", "guidance", "learning outcomes", "activity", "assessment", "competency level"]),
    ("syllabus", ["syllabus", "competency", "unit", "grade", "curriculum"]),
]

# crude topic keywords (expand anytime)
TOPIC_KEYWORDS = {
    "Mechanics": ["newton", "force", "momentum", "projectile", "work", "energy", "power"],
    "Waves": ["wave", "frequency", "wavelength", "diffraction", "interference", "superposition"],
    "Electricity": ["electric", "current", "voltage", "resistance", "capacitor", "field", "potential"],
    "Magnetism": ["magnetic", "flux", "induction", "faraday", "lorentz"],
    "Modern Physics": ["photoelectric", "quantum", "nuclear", "half-life", "radioactive", "relativity"],
    "Measurements": ["units", "dimensions", "error", "uncertainty", "significant figures"],
}


def detect_doc_type(rel_path: Path, text: str) -> str:
    # First, use folder hints if present
    parts = [p.lower() for p in rel_path.parts]
    for hint in ["syllabus", "teachers_guide", "past_papers", "marking_schemes", "related_resources"]:
        if hint in parts:
            return hint

    # fallback on content
    t = text.lower()
    for doc_type, cues in TYPE_RULES:
        if any(cue in t for cue in cues):
            return doc_type

    return "related_resources"


def detect_topic(text: str) -> str | None:
    t = text.lower()
    scores = {}
    for topic, kws in TOPIC_KEYWORDS.items():
        scores[topic] = sum(1 for k in kws if k in t)
    best = max(scores.items(), key=lambda x: x[1])
    return best[0] if best[1] >= 2 else None


def split_into_blocks(text: str) -> list[str]:
    # preserve page breaks but not required
    blocks = [b.strip() for b in text.split("=== PAGE BREAK ===") if b.strip()]
    return blocks if blocks else [text.strip()]


# ---- Past paper parsing ----
Q_START = re.compile(r"^\s*(\d{1,2})\s*[\.\)]\s+(.*)$")
SUBQ_START = re.compile(r"^\s*\(?([a-h])\)?\s*[\.\)]\s+(.*)$", re.IGNORECASE)


def parse_past_paper_questions(text: str) -> list[dict]:
    """
    Very practical heuristic:
    - detect lines like "1. ...." as new question
    - detect "(a) ...." as subquestion
    """
    questions = []
    current = None
    current_sub = None

    lines = [l.rstrip() for l in text.splitlines()]

    for line in lines:
        if not line.strip():
            continue

        m = Q_START.match(line)
        if m:
            # flush previous question
            if current:
                if current_sub:
                    current["subquestions"].append(current_sub)
                    current_sub = None
                questions.append(current)
            current = {
                "q_no": int(m.group(1)),
                "prompt": m.group(2).strip(),
                "subquestions": []
            }
            continue

        sm = SUBQ_START.match(line)
        if sm and current:
            # flush previous subquestion
            if current_sub:
                current["subquestions"].append(current_sub)
            current_sub = {
                "label": sm.group(1).lower(),
                "prompt": sm.group(2).strip()
            }
            continue

        # continuation lines
        if current_sub:
            current_sub["prompt"] += " " + line.strip()
        elif current:
            current["prompt"] += " " + line.strip()

    # flush end
    if current:
        if current_sub:
            current["subquestions"].append(current_sub)
        questions.append(current)

    return questions


# ---- Marking scheme parsing ----
MARK_PATTERNS = [
    re.compile(r"(\d+)\s*mark[s]?", re.IGNORECASE),
    re.compile(r"\(\s*(\d+)\s*\)\s*mark[s]?", re.IGNORECASE),
    re.compile(r"\[\s*(\d+)\s*\]\s*mark[s]?", re.IGNORECASE),
]


def parse_mark_allocations(text: str) -> list[dict]:
    """
    Extract simple mark mentions like "1 mark", "(2) marks", etc.
    """
    out = []
    for i, line in enumerate(text.splitlines(), start=1):
        s = line.strip()
        if not s:
            continue
        for pat in MARK_PATTERNS:
            m = pat.search(s)
            if m:
                out.append({"line_no": i, "text": s, "marks": int(m.group(1))})
                break
    return out


def build_parsed_record(rel_path: Path, text: str) -> dict:
    doc_type = detect_doc_type(rel_path, text)
    topic = detect_topic(text)

    record = {
        "file": rel_path.as_posix(),
        "doc_type": doc_type,
        "topic_guess": topic,
        "meta": {},
        "content": {}
    }

    # type-specific parsing
    if doc_type == "past_papers":
        qs = parse_past_paper_questions(text)
        record["content"]["questions"] = qs
        record["meta"]["question_count"] = len(qs)

    elif doc_type == "marking_schemes":
        marks = parse_mark_allocations(text)
        record["content"]["mark_mentions"] = marks
        record["meta"]["mark_mentions_count"] = len(marks)

    else:
        # for syllabus / guide / related: keep as sections (blocks)
        blocks = split_into_blocks(text)
        record["content"]["blocks"] = blocks
        record["meta"]["block_count"] = len(blocks)

    return record


def main():
    if not CLEANED_DIR.exists():
        raise FileNotFoundError(f"Missing: {CLEANED_DIR.resolve()}")

    txt_files = sorted(CLEANED_DIR.rglob("*.txt"))
    if not txt_files:
        print("No cleaned .txt files found in data/cleaned/")
        return

    PARSED_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    for in_path in tqdm(txt_files, desc="Semantic parsing"):
        rel = in_path.relative_to(CLEANED_DIR)
        out_path = PARSED_DIR / rel.with_suffix(".json")
        out_path.parent.mkdir(parents=True, exist_ok=True)

        text = in_path.read_text(encoding="utf-8", errors="ignore")
        rec = build_parsed_record(rel, text)

        out_path.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")

        rows.append({
            "in_txt": str(in_path.as_posix()),
            "out_json": str(out_path.as_posix()),
            "doc_type": rec["doc_type"],
            "topic_guess": rec["topic_guess"] or "",
            "chars": len(text),
        })

    df = pd.DataFrame(rows)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(MANIFEST_PATH, index=False, encoding="utf-8")

    print("\n✅ Semantic parsing done.")
    print(f"   Inputs : {len(rows)}")
    print(f"   Output : {PARSED_DIR.as_posix()}")
    print(f"   Manifest: {MANIFEST_PATH.as_posix()}")

    # quick summary
    print("\nDoc type counts:")
    print(df["doc_type"].value_counts())


if __name__ == "__main__":
    main()
