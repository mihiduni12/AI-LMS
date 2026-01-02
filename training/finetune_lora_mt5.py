import os
import glob
import argparse
from typing import Optional, Dict, Any

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
    )

    resume = None
    if train_cfg.get("resume_from_checkpoint", False):
        resume = find_latest_checkpoint(output_dir)

    trainer.train(resume_from_checkpoint=resume)

    # Save LoRA adapter + tokenizer
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    print(f"\n✅ Training done. Saved to: {output_dir}")
    if resume:
        print(f"Resumed from: {resume}")


if __name__ == "__main__":
    main()
