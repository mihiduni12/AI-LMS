# training/finetune_lora_mt5.py
import os
import glob
import json
import argparse
from typing import Optional, Dict, Any

import matplotlib.pyplot as plt

from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    DataCollatorForSeq2Seq,
    Trainer,
    TrainingArguments,
    set_seed,
)

from peft import LoraConfig, get_peft_model, TaskType


# -----------------------------
# Utils
# -----------------------------
def load_yaml(path: str) -> Dict[str, Any]:
    import yaml
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def find_latest_checkpoint(output_dir: str) -> Optional[str]:
    if not os.path.isdir(output_dir):
        return None
    ckpts = glob.glob(os.path.join(output_dir, "checkpoint-*"))
    if not ckpts:
        return None
    ckpts.sort(key=lambda x: int(x.split("-")[-1]))
    return ckpts[-1]


def format_prompt(instruction: str, inp: str) -> str:
    instruction = (instruction or "").strip()
    inp = (inp or "").strip()
    if inp:
        return f"Instruction: {instruction}\nInput: {inp}\nAnswer:"
    return f"Instruction: {instruction}\nAnswer:"


# -----------------------------
# Plotting
# -----------------------------
def plot_trainer_logs(output_dir: str):
    """
    Reads trainer_state.json and plots train/eval loss.
    Saves PNGs in output_dir.
    """
    state_path = os.path.join(output_dir, "trainer_state.json")
    if not os.path.exists(state_path):
        print("⚠️ trainer_state.json not found, skipping plots.")
        return

    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)

    history = state.get("log_history", [])
    steps, train_loss = [], []
    eval_steps, eval_loss = [], []

    for item in history:
        if "loss" in item and "step" in item and "eval_loss" not in item:
            steps.append(item["step"])
            train_loss.append(item["loss"])
        if "eval_loss" in item and "step" in item:
            eval_steps.append(item["step"])
            eval_loss.append(item["eval_loss"])

    if steps and train_loss:
        plt.figure()
        plt.plot(steps, train_loss)
        plt.xlabel("Step")
        plt.ylabel("Train Loss")
        plt.title("Training Loss")
        plt.grid(True)
        plt.savefig(os.path.join(output_dir, "train_loss.png"), dpi=160)
        plt.close()

    if eval_steps and eval_loss:
        plt.figure()
        plt.plot(eval_steps, eval_loss)
        plt.xlabel("Step")
        plt.ylabel("Eval Loss")
        plt.title("Validation Loss")
        plt.grid(True)
        plt.savefig(os.path.join(output_dir, "eval_loss.png"), dpi=160)
        plt.close()


# -----------------------------
# Helpers (optional, but kept)
# -----------------------------
def get_final_train_loss(output_dir: str):
    """
    Tries to read final training loss from trainer_state.json.
    This may be missing if HF didn't write it, so we also compute
    from train_result.metrics in main().
    """
    state_path = os.path.join(output_dir, "trainer_state.json")
    if not os.path.exists(state_path):
        return None

    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)

    losses = [
        item["loss"]
        for item in state.get("log_history", [])
        if "loss" in item and "eval_loss" not in item
    ]
    return losses[-1] if losses else None


def get_last_learning_rate(output_dir: str):
    """
    Tries to read last learning_rate from trainer_state.json.
    We also compute from trainer.state.log_history in main().
    """
    state_path = os.path.join(output_dir, "trainer_state.json")
    if not os.path.exists(state_path):
        return None

    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)

    lrs = [
        item["learning_rate"]
        for item in state.get("log_history", [])
        if "learning_rate" in item
    ]
    return lrs[-1] if lrs else None


# -----------------------------
# Main
# -----------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Path to YAML config")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)
    cfg = load_yaml(args.config)

    base_model = cfg["base_model_name_or_path"]
    train_file = cfg["train_file"]
    eval_file = cfg["eval_file"]
    output_dir = cfg["output_dir"]

    lora_cfg = cfg["lora"]
    train_cfg = cfg["training"]
    fmt = cfg["dataset_format"]

    os.makedirs(output_dir, exist_ok=True)

    # -----------------------------
    # Model & Tokenizer
    # -----------------------------
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model = AutoModelForSeq2SeqLM.from_pretrained(base_model)

    if train_cfg.get("gradient_checkpointing", False):
        model.gradient_checkpointing_enable()

    peft_config = LoraConfig(
        task_type=TaskType.SEQ_2_SEQ_LM,
        r=int(lora_cfg["r"]),
        lora_alpha=int(lora_cfg["alpha"]),
        lora_dropout=float(lora_cfg["dropout"]),
        target_modules=list(lora_cfg["target_modules"]),
        inference_mode=False,
    )

    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # -----------------------------
    # Dataset
    # -----------------------------
    ds = load_dataset(
        "json",
        data_files={"train": train_file, "validation": eval_file},
    )

    ins_k = fmt["instruction_key"]
    in_k = fmt["input_key"]
    out_k = fmt["output_key"]

    max_src = int(train_cfg["max_source_length"])
    max_tgt = int(train_cfg["max_target_length"])

    # ✅ FIX #1: Proper label masking (-100 for pad tokens)
    def preprocess(batch):
        prompts = [format_prompt(i, x) for i, x in zip(batch[ins_k], batch[in_k])]
        targets = [(t or "").strip() for t in batch[out_k]]

        model_inputs = tokenizer(
            prompts,
            max_length=max_src,
            truncation=True,
            padding="max_length",
        )

        with tokenizer.as_target_tokenizer():
            labels = tokenizer(
                targets,
                max_length=max_tgt,
                truncation=True,
                padding="max_length",
            )

        labels_ids = labels["input_ids"]
        labels_ids = [
            [(tok if tok != tokenizer.pad_token_id else -100) for tok in seq]
            for seq in labels_ids
        ]

        model_inputs["labels"] = labels_ids
        return model_inputs

    tokenized = ds.map(
        preprocess,
        batched=True,
        remove_columns=ds["train"].column_names,
    )

    # -----------------------------
    # ✅ CRITICAL SANITY CHECK
    # -----------------------------
    print("DEBUG labels sample:", tokenized["train"][0]["labels"][:20])

    # Must have at least some real tokens (not all -100)
    if all(x == -100 for x in tokenized["train"][0]["labels"]):
        raise ValueError("❌ Labels are all -100. Tokenization is broken.")

    # -----------------------------
    # Data collator
    # -----------------------------
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        pad_to_multiple_of=None,  # fp16 OFF
    )

    # -----------------------------
    # TrainingArguments
    # -----------------------------
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,

        max_steps=int(train_cfg["max_steps"]),
        per_device_train_batch_size=int(train_cfg["per_device_train_batch_size"]),
        per_device_eval_batch_size=int(train_cfg["per_device_eval_batch_size"]),
        gradient_accumulation_steps=int(train_cfg["gradient_accumulation_steps"]),

        learning_rate=float(train_cfg["learning_rate"]),
        warmup_steps=int(train_cfg["warmup_steps"]),
        weight_decay=float(train_cfg["weight_decay"]),
        max_grad_norm=float(train_cfg["max_grad_norm"]),

        logging_steps=int(train_cfg["logging_steps"]),

        # ✅ Transformers version uses eval_strategy (not evaluation_strategy)
        eval_strategy="steps",
        eval_steps=int(train_cfg["eval_steps"]),

        save_strategy="steps",
        save_steps=int(train_cfg["save_steps"]),
        save_total_limit=int(train_cfg["save_total_limit"]),

        prediction_loss_only=True,
        eval_accumulation_steps=int(train_cfg.get("eval_accumulation_steps", 8)),

        fp16=bool(train_cfg.get("fp16", False)),
        bf16=bool(train_cfg.get("bf16", False)) if "bf16" in train_cfg else False,

        report_to="none",
        remove_unused_columns=False,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=None,
    )

    # Resume optional (your YAML sets false)
    resume = None
    if train_cfg.get("resume_from_checkpoint", False):
        resume = find_latest_checkpoint(output_dir)

    # ✅ FIX #2: Capture train_result metrics reliably
    train_result = trainer.train(resume_from_checkpoint=resume)

    # Final eval (loss-only)
    metrics = trainer.evaluate()

    # -----------------------------
    # ✅ Final Summary (always prints)
    # -----------------------------
    final_eval_loss = metrics.get("eval_loss")
    final_train_loss = train_result.metrics.get("train_loss")

    # Learning rate (from trainer history)
    final_lr = None
    for item in reversed(trainer.state.log_history):
        if "learning_rate" in item:
            final_lr = item["learning_rate"]
            break

    epochs_completed = trainer.state.epoch if trainer.state.epoch is not None else 0.0
    total_steps = trainer.state.global_step
    effective_batch_size = (
        training_args.per_device_train_batch_size
        * training_args.gradient_accumulation_steps
    )

    print("\n================ FINAL TRAINING SUMMARY ================")
    print(f"Epochs completed        : {epochs_completed:.2f}")
    print(f"Total training steps    : {total_steps}")
    print(f"Effective batch size    : {effective_batch_size}")

    if final_lr is not None:
        print(f"Learning rate           : {final_lr:.2e}")
    else:
        print("Learning rate           : Not available")

    if final_train_loss is not None:
        print(f"Training loss           : {final_train_loss:.4f}")
    else:
        print("Training loss           : Not available")

    if final_eval_loss is not None:
        print(f"Validation loss         : {final_eval_loss:.4f}")
    else:
        print("Validation loss         : Not available")

    print("=======================================================")

    # -----------------------------
    # Save LoRA adapter + tokenizer
    # -----------------------------
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # -----------------------------
    # Save a few predictions for inspection
    # -----------------------------
    preds_out = os.path.join(output_dir, "val_predictions.jsonl")
    val_raw = ds["validation"]

    n = min(50, len(val_raw))
    sample = val_raw.select(range(n))

    prompts = [format_prompt(sample[i][ins_k], sample[i][in_k]) for i in range(n)]
    inputs = tokenizer(
        prompts,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=max_src,
    ).to(trainer.model.device)

    gen = trainer.model.generate(
        **inputs,
        max_new_tokens=max_tgt,
        num_beams=int(train_cfg.get("num_beams", 2)),
    )
    decoded = tokenizer.batch_decode(gen, skip_special_tokens=True)

    with open(preds_out, "w", encoding="utf-8") as f:
        for i in range(n):
            record = {
                "instruction": sample[i][ins_k],
                "input": sample[i][in_k],
                "reference": sample[i][out_k],
                "prediction": decoded[i].strip(),
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    # Plots
    plot_trainer_logs(output_dir)

    print(f"\n✅ Training done. Saved to: {output_dir}")
    print(f"✅ Predictions saved: {preds_out}")
    print("✅ Plots saved: train_loss.png, eval_loss.png")
    if resume:
        print(f"✅ Resumed from: {resume}")


if __name__ == "__main__":
    main()
