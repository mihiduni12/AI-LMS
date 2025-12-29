import json
import random
import re
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

# -------------------------
# Paths (✅ write to your standard folder)
# -------------------------
PARSED_DIR = Path("data/parsed")                 # produced by semantic_parse.py
OUT_DIR = Path("data/processed/sft")            # ✅ your standard location
TRAIN_PATH = OUT_DIR / "train.jsonl"
VALID_PATH = OUT_DIR / "valid.jsonl"
TEST_PATH = OUT_DIR / "test.jsonl"
MANIFEST_PATH = OUT_DIR / "manifest.json"

# -------------------------
# Config
# -------------------------
RANDOM_SEED = 42

# Split ratios (train/valid/test)
TRAIN_RATIO = 0.8
VALID_RATIO = 0.1
TEST_RATIO = 0.1

# Keep your 6-label taxonomy fixed (EXACT strings)
TOPIC_LABELS = [
    "Mechanics",
    "Waves",
    "Electricity",
    "Magnetism",
    "Modern Physics",
    "Measurements",
]

# Build both tasks?
INCLUDE_TOPIC_CLASSIFY = True

# Limits (increase later)
MAX_TUTOR_SAMPLES = 1200
MAX_CLASSIFY_SAMPLES = 1200

# ✅ Full combination (includes past_papers now)
ALLOW_TUTOR_DOC_TYPES = {
    "past_papers",
    "marking_schemes",
    "teachers_guide",
    "related_resources",
    "syllabus",
}

# -------------------------
# Prompts (tutoring-focused: theory + practical)
# -------------------------
TUTOR_INSTRUCTION = (
    "You are an A/L Physics tutor. Answer in a clear, step-by-step manner.\n"
    "Your response MUST include:\n"
    "1) Theory: explain the concept/principle clearly (definitions + key idea)\n"
    "2) Equations: write relevant equations and explain symbols + units\n"
    "3) Method/Derivation: show the working or reasoning step-by-step\n"
    "4) Final result: final answer (with units if numeric)\n"
    "5) Practical relevance: at least one real-world application/experiment link\n"
    "6) Common mistakes: mention 1–2 common student errors\n"
)

CLASSIFY_INSTRUCTION = (
    "Classify the question into ONE topic: Mechanics, Waves, Electricity, Magnetism, Modern Physics, Measurements. "
    "Return ONLY the topic label."
)

# -------------------------
# Utilities
# -------------------------
def safe_read_json(path: Path) -> Optional[dict]:
    try:
        return json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    except Exception:
        return None

def normalize_ws(text: str) -> str:
    text = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def pick_topic_label(topic_guess: Optional[str]) -> Optional[str]:
    """Ensure topic is one of the 6 labels."""
    if not topic_guess:
        return None
    mapping = {
        "Modern": "Modern Physics",
        "ModernPhysics": "Modern Physics",
        "Measurement": "Measurements",
        "Magnetism & Induction": "Magnetism",
    }
    t = mapping.get(topic_guess, topic_guess)
    return t if t in TOPIC_LABELS else None

def make_id(prefix: str, rel_file: str, extra: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9]+", "_", rel_file).strip("_")
    extra2 = re.sub(r"[^a-zA-Z0-9]+", "_", extra).strip("_")
    return f"{prefix}_{base}_{extra2}".lower()[:180]

def clamp_text(text: str, max_len: int) -> str:
    text = normalize_ws(text)
    return text[:max_len] if len(text) > max_len else text

# -------------------------
# Tutoring sample builders
# -------------------------
def build_from_past_paper(rec: dict) -> List[dict]:
    """
    Past papers: we create tutoring prompts from questions.
    Output is a structured tutoring response template (theory+equations+method+practical),
    because exact marking-scheme matching is a later upgrade.
    """
    out = []
    file = rec.get("file", "")
    doc_type = rec.get("doc_type", "")
    topic = pick_topic_label(rec.get("topic_guess"))
    questions = rec.get("content", {}).get("questions", []) or []

    for q in questions:
        q_no = q.get("q_no")
        prompt = (q.get("prompt") or "").strip()
        subs = q.get("subquestions") or []

        if not prompt:
            continue

        inp_lines = [f"Question {q_no}: {prompt}"] if q_no is not None else [prompt]
        if subs:
            inp_lines.append("\nSubparts:")
            for s in subs:
                lbl = s.get("label", "?")
                sp = (s.get("prompt") or "").strip()
                if sp:
                    inp_lines.append(f"({lbl}) {sp}")

        inp = normalize_ws("\n".join(inp_lines))

        # Tutoring-style output skeleton (still useful for SFT pipeline + tutoring behavior)
        out_text = normalize_ws(
            "1) Theory:\n"
            "- State the relevant physics principle and define key terms.\n\n"
            "2) Equations (with units):\n"
            "- Write the required equations, define symbols, and note units.\n\n"
            "3) Method / Working:\n"
            "- Show step-by-step reasoning/derivation.\n"
            "- If values are missing, clearly state assumptions.\n\n"
            "4) Final result:\n"
            "- Give the final expression/value with correct units.\n\n"
            "5) Practical relevance:\n"
            "- Mention an experiment or real-world application related to this concept.\n\n"
            "6) Common mistakes:\n"
            "- List 1–2 typical errors students make for this type of question."
        )

        out.append({
            "id": make_id("tutor", file, f"pp_q{q_no if q_no is not None else 'x'}"),
            "task": "physics_tutoring",
            "instruction": TUTOR_INSTRUCTION,
            "input": inp,
            "output": out_text,
            "meta": {
                "doc_type": doc_type,
                "topic_guess": topic or "",
                "source_file": file,
                "source_type": "past_papers",
            }
        })

    return out

def build_from_marking_scheme(rec: dict) -> List[dict]:
    """
    Builds tutoring samples from marking scheme reasoning lines.
    """
    out = []
    file = rec.get("file", "")
    doc_type = rec.get("doc_type", "")
    topic = pick_topic_label(rec.get("topic_guess"))

    text_blocks = rec.get("content", {}).get("mark_mentions", []) or []
    for m in text_blocks:
        line = (m.get("text") or "").strip()
        if len(line) < 30:
            continue

        inp = normalize_ws(
            "Explain this marking-scheme step in a student-friendly way and why it is correct:\n"
            f"{line}"
        )

        out_text = normalize_ws(
            "1) Theory: explain the principle behind this step.\n"
            "2) Equations: write any relevant equation(s), define symbols + units.\n"
            "3) Reasoning: explain why this step earns marks and how it leads toward the answer.\n"
            "4) Practical relevance: relate it to an experiment/real-world situation.\n"
            "5) Common mistakes: mention 1–2 typical mistakes students make here."
        )

        out.append({
            "id": make_id("tutor", file, f"msline{m.get('line_no', 0)}"),
            "task": "physics_tutoring",
            "instruction": TUTOR_INSTRUCTION,
            "input": inp,
            "output": out_text,
            "meta": {
                "doc_type": doc_type,
                "topic_guess": topic or "",
                "source_file": file,
                "source_type": "marking_schemes",
            }
        })

    return out

def build_from_blocks(rec: dict) -> List[dict]:
    """
    For syllabus/teachers_guide/related_resources: create tutoring explanations from blocks.
    """
    out = []
    file = rec.get("file", "")
    doc_type = rec.get("doc_type", "")
    topic = pick_topic_label(rec.get("topic_guess"))

    blocks = rec.get("content", {}).get("blocks", []) or []
    for idx, b in enumerate(blocks, start=1):
        b = normalize_ws(b)
        if len(b) < 350:
            continue

        inp = normalize_ws(
            "Teach this A/L Physics content clearly with theory + equations + an example + practical relevance:\n\n"
            f"{clamp_text(b, 1600)}"
        )

        out_text = normalize_ws(
            "1) Theory: explain the concept clearly (definitions + key idea).\n"
            "2) Equations: write and explain relevant equations, symbols, and units.\n"
            "3) Example: provide a simple worked example or numeric illustration.\n"
            "4) Practical relevance: relate to a real-world application/experiment.\n"
            "5) Common mistakes: mention 1–2 common errors and how to avoid them."
        )

        out.append({
            "id": make_id("tutor", file, f"block{idx}"),
            "task": "physics_tutoring",
            "instruction": TUTOR_INSTRUCTION,
            "input": inp,
            "output": out_text,
            "meta": {
                "doc_type": doc_type,
                "topic_guess": topic or "",
                "source_file": file,
                "source_type": doc_type,
            }
        })

    return out

# -------------------------
# Topic classification builder
# -------------------------
def build_topic_classify_from_tutor(tutor_samples: List[dict]) -> List[dict]:
    out = []
    for s in tutor_samples:
        topic = (s.get("meta", {}).get("topic_guess") or "").strip()
        if topic not in TOPIC_LABELS:
            continue

        out.append({
            "id": s["id"].replace("tutor_", "topic_"),
            "task": "topic_classify",
            "instruction": CLASSIFY_INSTRUCTION,
            "input": s["input"],
            "output": topic,  # MUST be exactly one label
            "meta": {
                "language": "en",
                "source_file": s.get("meta", {}).get("source_file", ""),
            }
        })
    return out

# -------------------------
# Main
# -------------------------
def split_train_valid_test(samples: List[dict]) -> Dict[str, List[dict]]:
    n = len(samples)
    if n == 0:
        return {"train": [], "valid": [], "test": []}

    n_train = int(n * TRAIN_RATIO)
    n_valid = int(n * VALID_RATIO)
    n_test = n - n_train - n_valid

    train = samples[:n_train]
    valid = samples[n_train:n_train + n_valid]
    test = samples[n_train + n_valid:]

    # Ensure non-empty valid/test if dataset is decent sized
    if n >= 50:
        if len(valid) == 0:
            valid = train[-1:]
            train = train[:-1]
        if len(test) == 0:
            test = train[-1:]
            train = train[:-1]

    return {"train": train, "valid": valid, "test": test}

def main():
    random.seed(RANDOM_SEED)

    if not PARSED_DIR.exists():
        raise FileNotFoundError(f"Missing: {PARSED_DIR.resolve()}")

    parsed_files = sorted(PARSED_DIR.rglob("*.json"))
    if not parsed_files:
        print("No parsed .json files found in data/parsed/")
        return

    tutor_samples: List[dict] = []
    source_counts: Dict[str, int] = {}

    for p in parsed_files:
        rec = safe_read_json(p)
        if not rec:
            continue

        doc_type = rec.get("doc_type", "")
        if doc_type not in ALLOW_TUTOR_DOC_TYPES:
            continue

        source_counts[doc_type] = source_counts.get(doc_type, 0) + 1

        if doc_type == "past_papers":
            tutor_samples.extend(build_from_past_paper(rec))
        elif doc_type == "marking_schemes":
            tutor_samples.extend(build_from_marking_scheme(rec))
        else:
            tutor_samples.extend(build_from_blocks(rec))

    # Shuffle + cap
    random.shuffle(tutor_samples)
    tutor_samples = tutor_samples[:MAX_TUTOR_SAMPLES]

    all_samples = list(tutor_samples)

    if INCLUDE_TOPIC_CLASSIFY:
        cls_samples = build_topic_classify_from_tutor(tutor_samples)
        random.shuffle(cls_samples)
        cls_samples = cls_samples[:MAX_CLASSIFY_SAMPLES]
        all_samples.extend(cls_samples)

    random.shuffle(all_samples)

    if len(all_samples) == 0:
        print("⚠️ No samples created. Check doc_type values and parsed content structure.")
        return

    # Split
    splits = split_train_valid_test(all_samples)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Write JSONL
    def write_jsonl(path: Path, rows: List[dict]):
        with path.open("w", encoding="utf-8") as f:
            for r in rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    write_jsonl(TRAIN_PATH, splits["train"])
    write_jsonl(VALID_PATH, splits["valid"])
    write_jsonl(TEST_PATH, splits["test"])

    # Manifest
    def count_task(rows: List[dict], task: str) -> int:
        return sum(1 for x in rows if x.get("task") == task)

    manifest: Dict[str, Any] = {
        "created_at": datetime.utcnow().isoformat() + "Z",
        "random_seed": RANDOM_SEED,
        "topics": TOPIC_LABELS,
        "include_topic_classify": INCLUDE_TOPIC_CLASSIFY,
        "allow_doc_types": sorted(list(ALLOW_TUTOR_DOC_TYPES)),
        "limits": {
            "max_tutor_samples": MAX_TUTOR_SAMPLES,
            "max_classify_samples": MAX_CLASSIFY_SAMPLES,
        },
        "counts": {
            "total": len(all_samples),
            "train": len(splits["train"]),
            "valid": len(splits["valid"]),
            "test": len(splits["test"]),
            "physics_tutoring": count_task(all_samples, "physics_tutoring"),
            "topic_classify": count_task(all_samples, "topic_classify"),
        },
        "parsed_file_doc_type_counts": source_counts,
        "note": "Tutoring-first dataset with theory + equations + practical relevance. Past papers included as prompts (answers are structured tutoring outputs; exact marking-scheme matching can be added later)."
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n✅ SFT dataset build complete (combined sources, tutoring-first).")
    print(f"   Total samples : {manifest['counts']['total']}")
    print(f"   Train         : {manifest['counts']['train']}  -> {TRAIN_PATH.as_posix()}")
    print(f"   Valid         : {manifest['counts']['valid']}  -> {VALID_PATH.as_posix()}")
    print(f"   Test          : {manifest['counts']['test']}   -> {TEST_PATH.as_posix()}")
    print(f"   Tutoring      : {manifest['counts']['physics_tutoring']}")
    print(f"   Topic classify: {manifest['counts']['topic_classify']}")
    print(f"   Manifest      : {MANIFEST_PATH.as_posix()}")
    print("\nTip: Main focus is always theory + practical explanation style tutoring.")

if __name__ == "__main__":
    main()
