import json
import matplotlib.pyplot as plt
from pathlib import Path
import re

RUN_DIR = Path("/content/drive/MyDrive/AI-LMS/runs/mt5-small-lora-pp1")

# --------------------------
# Find latest checkpoint
# --------------------------
checkpoint_dirs = [
    d for d in RUN_DIR.iterdir()
    if d.is_dir() and re.match(r"checkpoint-\d+", d.name)
]

if not checkpoint_dirs:
    raise FileNotFoundError("❌ No checkpoint-* folders found in run directory.")

checkpoint_dirs.sort(key=lambda x: int(x.name.split("-")[1]))
LATEST_CHECKPOINT = checkpoint_dirs[-1]

STATE_PATH = LATEST_CHECKPOINT / "trainer_state.json"
print(f"✅ Using checkpoint: {LATEST_CHECKPOINT.name}")
print(f"✅ Reading: {STATE_PATH}")

# --------------------------
# Output folder
# --------------------------
PLOTS_DIR = RUN_DIR / "plots"
PLOTS_DIR.mkdir(parents=True, exist_ok=True)

# --------------------------
# Load logs
# --------------------------
with open(STATE_PATH, "r") as f:
    state = json.load(f)

train_steps, train_loss = [], []
eval_steps, eval_loss = [], []
lr_steps, lrs = [], []

for log in state.get("log_history", []):
    step = log.get("step")

    if step is None:
        continue

    # training loss
    if "loss" in log and "eval_loss" not in log:
        train_steps.append(step)
        train_loss.append(log["loss"])

    # validation loss
    if "eval_loss" in log:
        eval_steps.append(step)
        eval_loss.append(log["eval_loss"])

    # learning rate
    if "learning_rate" in log:
        lr_steps.append(step)
        lrs.append(log["learning_rate"])

print(f"ℹ️ Train points: {len(train_steps)}")
print(f"ℹ️ Eval points : {len(eval_steps)}")
print(f"ℹ️ LR points   : {len(lr_steps)}")

# --------------------------
# Plot 1: Train vs Val
# --------------------------
plt.figure(figsize=(9, 5))
plt.plot(train_steps, train_loss, label="Training Loss")

if len(eval_steps) == 1:
    # show single eval as a dot
    plt.scatter(eval_steps, eval_loss, label="Validation Loss", s=60)
else:
    plt.plot(eval_steps, eval_loss, marker="o", label="Validation Loss")

plt.xlabel("Training Steps")
plt.ylabel("Loss")
plt.title("Training vs Validation Loss (mT5-small + LoRA)")
plt.grid(True)
plt.legend()

out1 = PLOTS_DIR / "loss_train_vs_val.png"
plt.savefig(out1, dpi=300, bbox_inches="tight")
plt.show()
print(f"✅ Saved: {out1}")

# --------------------------
# Plot 2: Training only
# --------------------------
plt.figure(figsize=(9, 5))
plt.plot(train_steps, train_loss)
plt.xlabel("Training Steps")
plt.ylabel("Training Loss")
plt.title("Training Loss Curve")
plt.grid(True)

out2 = PLOTS_DIR / "train_loss.png"
plt.savefig(out2, dpi=300, bbox_inches="tight")
plt.show()
print(f"✅ Saved: {out2}")

# --------------------------
# Plot 3: Validation only
# --------------------------
plt.figure(figsize=(9, 5))

if not eval_steps:
    print("⚠️ No validation loss found (eval disabled or not logged).")
else:
    if len(eval_steps) == 1:
        plt.scatter(eval_steps, eval_loss, s=80)
        plt.xlim(eval_steps[0] - 10, eval_steps[0] + 10)  # zoom so dot is visible
    else:
        plt.plot(eval_steps, eval_loss, marker="o")

    plt.xlabel("Training Steps")
    plt.ylabel("Validation Loss")
    plt.title("Validation Loss Curve")
    plt.grid(True)

    out3 = PLOTS_DIR / "val_loss.png"
    plt.savefig(out3, dpi=300, bbox_inches="tight")
    plt.show()
    print(f"✅ Saved: {out3}")

# --------------------------
# Plot 4: Learning Rate
# --------------------------
plt.figure(figsize=(9, 5))

if not lr_steps:
    print("ℹ️ Learning rate not logged (this is OK).")
else:
    plt.plot(lr_steps, lrs)
    plt.xlabel("Training Steps")
    plt.ylabel("Learning Rate")
    plt.title("Learning Rate Schedule")
    plt.grid(True)

    out4 = PLOTS_DIR / "learning_rate.png"
    plt.savefig(out4, dpi=300, bbox_inches="tight")
    plt.show()
    print(f"✅ Saved: {out4}")
