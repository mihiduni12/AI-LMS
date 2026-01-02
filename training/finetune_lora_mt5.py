# training/finetune_lora_mt5.py
import os
import glob
import json
import argparse
from typing import Optional, Dict, Any, List

import numpy as np
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

# Metrics
import evaluate


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


def safe_decode(tokenizer, ids) -> str:
    # Replace -100 with pad token id for decoding labels
    ids = [t if t != -100 else tokenizer.pad_token_id for t in ids]
    return tokenizer.decode(ids, skip_special_tokens=True).strip()


def plot_trainer_logs(output_dir: str):
    """
    Reads trainer_state.json and plots train/eval loss and ROUGE-L if available.
    Saves PNGs in output_dir.
    """
    state_path = os.path.join(output_dir, "trainer_state.json")
    if not os.path.exists(state_path):
        print("⚠️ trainer_state.json not found, skipping plots.")
        return

    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)

    history = state.get("log_history", [])
    steps = []
    train_loss = []
    eval_steps = []
    eval_loss = []
    rougeL = []

    for item in history:
        if "loss" in item and "step" in item and "eval_loss" not in item:
            steps.append(item["step"])
            train_loss.append(item["loss"])
        if "eval_loss" in item and "step" in item:
            eval_steps.append(item["step"])
            eval_loss.append(item["eval_loss"])
            # metric name depends on evaluate output; we'll store rougeL if present
            if "eval_rougeL" in item:
                rougeL.append((item["step"], item["eval_rougeL"]))

    # Plot loss curves
    if steps and train_loss:
        plt.figure()
        plt.plot(steps, train_loss)
        plt.xlabel("Step")
        plt.ylabel("Train Loss")
        plt.title("Training Loss")
        plt.savefig(os.path.join(output_dir, "train_loss.png"), dpi=160)
        plt.close()

    if eval_steps and eval_loss:
        plt.figure()
        plt.plot(eval_steps, eval_loss)
        plt.xlabel("Step")
        plt.ylabel("Eval Loss")
        plt.title("Evaluation Loss")
        plt.savefig(os.path.join(output_dir, "eval_loss.png"), dpi=160)
        plt.close()

    # Plot ROUGE-L if available
    if rougeL:
        xs = [s for s, v in rougeL]
        ys = [v for s, v in rougeL]
        plt.figure()
        plt.plot(xs, ys)
        plt.xlabel("Step")
        plt.ylabel("ROUGE-L")
        plt.title("ROUGE-L over training")
        plt.savefig(os.path.join(output_dir, "rougeL.png"), dpi=160)
        plt.close()


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

    ds = load_dataset("json", data_files={"train": train_file, "validation": eval_file})

    ins_k = fmt["instruction_key"]
    in_k = fmt["input_key"]
    out_k = fmt["output_key"]

    max_src = int(train_cfg["max_source_length"])
    max_tgt = int(train_cfg["max_target_length"])

    def preprocess(batch):
        prompts = [format_prompt(i, x) for i, x in zip(batch[ins_k], batch[in_k])]
        targets = [(t or "").strip() for t in batch[out_k]]

        model_inputs = tokenizer(prompts, max_length=max_src, truncation=True)
        labels = tokenizer(text_target=targets, max_length=max_tgt, truncation=True)
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    tokenized = ds.map(preprocess, batched=True, remove_columns=ds["train"].column_names)

    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        pad_to_multiple_of=8 if train_cfg.get("fp16", False) else None,
    )

    # Metrics for generation
    rouge = evaluate.load("rouge")

    def compute_metrics(eval_preds):
        preds, labels = eval_preds
        # preds may be tuple in some versions
        if isinstance(preds, tuple):
            preds = preds[0]

        decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
        decoded_labels = [safe_decode(tokenizer, lab) for lab in labels]

        decoded_preds = [p.strip() for p in decoded_preds]
        decoded_labels = [l.strip() for l in decoded_labels]

        # Exact match (strict)
        em = np.mean([1.0 if p == l else 0.0 for p, l in zip(decoded_preds, decoded_labels)])

        # ROUGE
        rouge_scores = rouge.compute(
            predictions=decoded_preds,
            references=decoded_labels,
            use_stemmer=False
        )

        return {
            "exact_match": float(em),
            "rouge1": float(rouge_scores["rouge1"]),
            "rouge2": float(rouge_scores["rouge2"]),
            "rougeL": float(rouge_scores["rougeL"]),
        }

    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=False,

        max_steps=int(train_cfg["max_steps"]),
        per_device_train_batch_size=int(train_cfg["per_device_train_batch_size"]),
        per_device_eval_batch_size=int(train_cfg["per_device_eval_batch_size"]),
        gradient_accumulation_steps=int(train_cfg["gradient_accumulation_steps"]),

        learning_rate=float(train_cfg["learning_rate"]),
        warmup_steps=int(train_cfg["warmup_steps"]),
        weight_decay=float(train_cfg["weight_decay"]),
        max_grad_norm=float(train_cfg["max_grad_norm"]),

        logging_steps=int(train_cfg["logging_steps"]),
        evaluation_strategy="steps",
        eval_steps=int(train_cfg["eval_steps"]),
        save_strategy="steps",
        save_steps=int(train_cfg["save_steps"]),
        save_total_limit=int(train_cfg["save_total_limit"]),

        fp16=bool(train_cfg.get("fp16", False)),
        bf16=bool(train_cfg.get("bf16", False)),

        # Generation during eval (important for metrics)
        predict_with_generate=bool(train_cfg.get("predict_with_generate", True)),
        generation_max_length=int(train_cfg["max_target_length"]),
        generation_num_beams=int(train_cfg.get("num_beams", 2)),

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
        compute_metrics=compute_metrics,
    )

    resume = None
    if train_cfg.get("resume_from_checkpoint", False):
        resume = find_latest_checkpoint(output_dir)

    trainer.train(resume_from_checkpoint=resume)

    # Final eval
    metrics = trainer.evaluate()
    print("\n✅ Final eval metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v}")

    # Save LoRA adapter + tokenizer
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # Save a few predictions for inspection
    preds_out = os.path.join(output_dir, "val_predictions.jsonl")
    val_raw = ds["validation"]

    # Generate on a small sample to keep it fast
    n = min(50, len(val_raw))
    sample = val_raw.select(range(n))

    prompts = [format_prompt(sample[i][ins_k], sample[i][in_k]) for i in range(n)]
    inputs = tokenizer(prompts, return_tensors="pt", padding=True, truncation=True, max_length=max_src).to(trainer.model.device)

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

    # Plot graphs from trainer logs
    plot_trainer_logs(output_dir)

    print(f"\n✅ Training done. Saved to: {output_dir}")
    print(f"✅ Predictions saved: {preds_out}")
    print("✅ Plots saved: train_loss.png, eval_loss.png, rougeL.png (if available)")
    if resume:
        print(f"Resumed from: {resume}")


if __name__ == "__main__":
    main()
