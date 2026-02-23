import os
import json

ROOT = "."
OUTPUT_FILE = "PROJECT_DUMP.md"

FILES = [
    "index.html",
    "style.css",
    "app.js",
    os.path.join("data", "gr.json"),
    os.path.join("data", "es.json"),
]

MAX_JSON_CHARS = 2000  # límite para truncar JSON


def truncate_json(content):
    if len(content) <= MAX_JSON_CHARS:
        return content
    return content[:MAX_JSON_CHARS] + "\n\n... (TRUNCATED) ..."


def format_code_block(filename, content):
    ext = filename.split(".")[-1]
    if ext in ["js"]:
        lang = "javascript"
    elif ext in ["html"]:
        lang = "html"
    elif ext in ["css"]:
        lang = "css"
    elif ext in ["json"]:
        lang = "json"
    else:
        lang = ""
    return f"## 📄 `{filename}`\n\n```{lang}\n{content}\n```\n\n"


def main():
    md = "# 📦 PROJECT STRUCTURE DUMP\n\n"

    for file in FILES:
        if not os.path.exists(file):
            md += f"## ❌ `{file}` NOT FOUND\n\n"
            continue

        with open(file, "r", encoding="utf-8") as f:
            content = f.read()

        if file.endswith(".json"):
            content = truncate_json(content)

        md += format_code_block(file, content)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write(md)

    print(f"✅ Archivo generado: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()