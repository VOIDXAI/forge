#!/usr/bin/env node
// scaffold.js — Initialize forge knowledge base directory structure
// Usage: node scaffold.js <root_path> [kb_name]
// Idempotent: safe to run multiple times.

const fs = require("fs");
const path = require("path");

const rootPath = process.argv[2];
const kbName = process.argv[3] || "forge";

if (!rootPath) {
  console.error("Usage: node scaffold.js <root_path> [kb_name]");
  process.exit(1);
}

const forgeRoot = path.join(rootPath, kbName);

function writeIfMissing(filePath, content, label) {
  if (fs.existsSync(filePath)) {
    console.log(`Already exists: ${filePath}`);
    return false;
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created ${filePath}`);
  return true;
}

// Create directories
fs.mkdirSync(path.join(forgeRoot, "raw"), { recursive: true });
fs.mkdirSync(path.join(forgeRoot, "wiki"), { recursive: true });

// Create _manifest.yaml
writeIfMissing(
  path.join(forgeRoot, "_manifest.yaml"),
  `version: 1
last_compiled: null

sources: {}

articles: {}
`
);

// Create forge.yaml
writeIfMissing(
  path.join(forgeRoot, "forge.yaml"),
  `name: "${kbName}"
paths:
  root: "${kbName}"
  raw: "raw"
  wiki: "wiki"
compilation:
  parallel: false
  article_style: detailed
  auto_crossref: true
query:
  default_depth: quick
  max_web_sources: 3
lint:
  ignore_rules: []
  sparse_threshold: 100
evolve:
  require_confirmation: true
  max_changes_per_run: 20
`
);

// Create wiki/_index.md
writeIfMissing(
  path.join(forgeRoot, "wiki", "_index.md"),
  `---
title: Knowledge Base Index
kind: index
---

# Knowledge Base Index

> No articles yet. Use \`/forge ingest\` to add sources, then \`/forge compile\`.
`
);

// Create wiki/_log.md
writeIfMissing(
  path.join(forgeRoot, "wiki", "_log.md"),
  `---
title: Change Log
kind: log
---

# Change Log
`
);

console.log(`
Forge knowledge base initialized at: ${forgeRoot}
  raw/           — drop source materials here
  wiki/          — LLM-maintained wiki (do not edit)
  forge.yaml     — configuration
  _manifest.yaml — compilation state (do not edit)`);
