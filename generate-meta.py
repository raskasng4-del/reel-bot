#!/usr/bin/env python3
import argparse
import os
import json
from groq import Groq

GROQ_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_KEY:
    print("{\"error\":\"GROQ_API_KEY not set\"}")
    exit(1)

client = Groq(api_key=GROQ_KEY)

PROMPT = """You are a social media content writer for a philosophy & psychology quote page.
Given a philosopher/psychologist name and their quote, generate:
1. A short engaging YouTube title (max 60 chars, clickable)
2. A description (2-3 sentences explaining the quote + a call to follow)
3. 12-15 relevant hashtags (mix of philosopher name, topic, and general philosophy tags)

Return ONLY valid JSON with keys: title, description, hashtags (as string with # tags space-separated)
No markdown, no backticks, no extra text."""

def generate(name: str, quote: str) -> dict:
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": f"Philosopher: {name}\nQuote: \"{quote}\""},
        ],
        temperature=0.7,
        max_tokens=300,
    )
    text = resp.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("\n", 1)[0]
    return json.loads(text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("name")
    parser.add_argument("quote")
    parser.add_argument("--pretty", action="store_true")
    args = parser.parse_args()
    meta = generate(args.name, args.quote)
    if args.pretty:
        print(json.dumps(meta, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(meta, ensure_ascii=False))
