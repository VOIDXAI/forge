#!/usr/bin/env node
// hash_tracker.js — SHA256 content hash tracking for incremental compilation
// Usage:
//   node hash_tracker.js compute <file>     — output body-only SHA256
//   node hash_tracker.js bulk <raw_dir>     — output JSON map {filename: hash}
//
// Content hash excludes YAML frontmatter so metadata changes don't trigger recompilation.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const action = process.argv[2];
const target = process.argv[3];

if (!action || !target) {
  console.error("Usage: node hash_tracker.js <compute|bulk> <path>");
  process.exit(1);
}

/**
 * Extract body text from a markdown file, stripping YAML frontmatter.
 * If frontmatter is unclosed or absent, returns the entire content.
 */
function extractBody(content) {
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    return content;
  }

  // Find closing ---
  const lines = content.split(/\r?\n/);
  let fmEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      fmEnd = i;
      break;
    }
  }

  if (fmEnd === -1) {
    // Unclosed frontmatter — treat entire file as body
    return content;
  }

  return lines.slice(fmEnd + 1).join("\n");
}

function computeHash(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const body = extractBody(content);
  const hash = crypto.createHash("sha256").update(body, "utf8").digest("hex");
  return `sha256:${hash}`;
}

switch (action) {
  case "compute": {
    if (!fs.existsSync(target)) {
      console.error(`Error: File not found: ${target}`);
      process.exit(1);
    }
    console.log(computeHash(target));
    break;
  }

  case "bulk": {
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
      console.error(`Error: Directory not found: ${target}`);
      process.exit(1);
    }
    const files = fs.readdirSync(target).filter((f) => f.endsWith(".md")).sort();
    const result = {};
    for (const file of files) {
      result[file] = computeHash(path.join(target, file));
    }
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  default:
    console.error(`Unknown action: ${action}`);
    console.error("Usage: node hash_tracker.js <compute|bulk> <path>");
    process.exit(1);
}
