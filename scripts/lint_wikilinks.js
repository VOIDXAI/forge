#!/usr/bin/env node
// lint_wikilinks.js — Validate wikilinks in wiki articles
// Usage: node lint_wikilinks.js <wiki_dir>
// Output: JSON array of {file, line, link, status} objects
//   status: "ok" | "broken"
//
// Extracts all [[wikilinks]] from .md files, checks if target .md file exists.
// Only checks direct id references (not aliases — alias resolution requires Obsidian).

const fs = require("fs");
const path = require("path");

const wikiDir = process.argv[2];

if (!wikiDir) {
  console.error("Usage: node lint_wikilinks.js <wiki_dir>");
  process.exit(1);
}

if (!fs.existsSync(wikiDir) || !fs.statSync(wikiDir).isDirectory()) {
  console.error(`Error: Directory not found: ${wikiDir}`);
  process.exit(1);
}

const SKIP_FILES = new Set(["_index.md", "_lint-report.md", "_manifest.yaml"]);
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

const results = [];

const files = fs.readdirSync(wikiDir).filter(
  (f) => f.endsWith(".md") && !SKIP_FILES.has(f)
);

for (const file of files) {
  const filePath = path.join(wikiDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    WIKILINK_RE.lastIndex = 0;

    while ((match = WIKILINK_RE.exec(line)) !== null) {
      const inner = match[1];
      if (!inner) continue;

      // Extract link target (before | if display text exists)
      const linkTarget = inner.split("|")[0];
      if (!linkTarget) continue;

      // Skip raw/ references
      if (linkTarget.startsWith("raw/")) continue;

      // Skip same-note heading references
      if (linkTarget.startsWith("#")) continue;

      // Strip heading/block suffix for file existence check
      const fileTarget = linkTarget.split("#")[0];
      if (!fileTarget) continue;

      const exists = fs.existsSync(path.join(wikiDir, `${fileTarget}.md`));

      results.push({
        file,
        line: i + 1,
        link: linkTarget,
        status: exists ? "ok" : "broken",
      });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
