from pathlib import Path

ROOT = Path("data/extracted")
MIN_CHARS = 1200
MIN_CONTENT_LINES = 30


def looks_empty(text: str) -> bool:
    t = (text or "").strip()
    if len(t) < MIN_CHARS:
        return True

    lines = [x.strip() for x in t.splitlines() if x.strip()]
    content_lines = [l for l in lines if not l.startswith("--- PAGE")]

    if len(content_lines) < MIN_CONTENT_LINES:
        return True

    return False


bad = []
all_txts = list(ROOT.rglob("*.txt"))

for p in sorted(all_txts):
    txt = p.read_text(encoding="utf-8", errors="ignore")
    if looks_empty(txt):
        bad.append(p)

print(f"Total txt files: {len(all_txts)}")
print(f"Empty / junk files: {len(bad)}")

print("\nSample junk files:")
for p in bad[:20]:
    print(" -", p.as_posix())
