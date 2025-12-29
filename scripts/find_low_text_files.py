from pathlib import Path

ROOT = Path("data/extracted")
THRESH = 500  # characters

bad = []
for p in ROOT.rglob("*.txt"):
    txt = p.read_text(encoding="utf-8", errors="ignore").strip()
    if len(txt) < THRESH:
        bad.append((len(txt), p.as_posix()))

bad.sort(key=lambda x: x[0])

print(f"Total extracted txt files: {len(list(ROOT.rglob('*.txt')))}")
print(f"Low-text files (<{THRESH} chars): {len(bad)}")
for n, path in bad[:50]:
    print(n, path)
