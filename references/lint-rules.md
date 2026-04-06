# Lint Rules

Complete ruleset for `/forge lint`. Each rule has a severity, detection method, and degraded behavior.

## Rule Definitions

### broken-wikilink (error)

**Description**: A `[[wikilink]]` target does not resolve to any existing wiki article.

**Detection**: Run `<skill-base>/scripts/lint_wikilinks.js <wiki_dir>`. Reports all wikilinks with `status: "broken"`.

**Degraded (no obsidian-cli)**: Fully functional — file existence check only, no alias resolution needed.

**Auto-fix**: Create a stub article for the target, or suggest user review.

---

### missing-frontmatter (error)

**Description**: Article lacks required YAML frontmatter fields: `title`, `id`, `kind`, `created`.

**Detection**: Read each article, parse YAML frontmatter, check for required fields.

**Degraded (no obsidian-cli)**: Fully functional — Read + YAML parsing.

**Auto-fix**: Add missing fields with defaults (kind: compiled, created: file creation date).

---

### orphan-article (warning)

**Description**: Article has zero inbound wikilinks from other articles (no other article links to it).

**Detection**:
- With obsidian-cli: `obsidian backlinks file="article-id"` → check if empty
- Without obsidian-cli: Grep all wiki articles for `[[article-id]]` and `[[article-id|` patterns
  - ⚠️ May miss alias references (Obsidian resolves aliases to the canonical note, but Grep won't)

**Degraded note**: Output `⚠️ Orphan detection approximate (no obsidian-cli) — alias references may be missed`

**Auto-fix**: Suggest adding cross-references in evolve pass.

---

### stale-source (warning)

**Description**: A raw source file's content has changed since it was last compiled.

**Detection**: Run `<skill-base>/scripts/hash_tracker.js compute <file>` for each active source, compare against `content_hash` in `_manifest.yaml`.

**Degraded (no obsidian-cli)**: Fully functional — hash comparison is file-based.

**Auto-fix**: Suggest recompiling with `/forge compile`.

---

### sparse-article (warning)

**Description**: Article body is below the word count threshold (default: 100 words).

**Detection**: Read article, count words in body (excluding frontmatter).

**Degraded (no obsidian-cli)**: Fully functional.

**Threshold**: Configurable via `forge.yaml lint.sparse_threshold`.

**Auto-fix**: Mark as stub if not already, prioritize in evolve.

---

### contradiction (info) — only with `--deep`

**Description**: Two articles make conflicting claims about the same entity or concept.

**Detection**: LLM semantic analysis. For articles sharing 2+ tags or 3+ wikilinks:
1. Read both articles
2. Ask: "Do these articles contain contradictory claims?"
3. Report any contradictions found with specific quotes

**Degraded (no obsidian-cli)**: Fully functional — this is LLM-powered, not CLI-dependent.

**Auto-fix**: Flag for human review. Evolve can suggest resolution.

---

### duplicate-concept (warning) — only with `--deep`

**Description**: Two articles cover substantially the same topic (>70% overlapping references).

**Detection**:
1. For each article, collect set of outbound wikilinks
2. Compute Jaccard similarity between all article pairs
3. Flag pairs with similarity > 0.7

**Degraded (no obsidian-cli)**: Functional via Grep extraction of wikilinks. With obsidian-cli, search is more precise.

**Auto-fix**: Suggest merge in evolve. Older article (by `created` date) becomes primary.

---

## Report Format

`/forge lint` writes results to `wiki/_lint-report.md`:

```markdown
---
title: Lint Report
kind: report
created: 2026-04-05
---

# Lint Report — 2026-04-05

> Errors: {N} | Warnings: {N} | Info: {N}

## Errors

### broken-wikilink
- [[source-article]] line 15: `[[nonexistent-target]]` — target not found

### missing-frontmatter
- [[incomplete-article]] — missing fields: kind, created

## Warnings

### orphan-article
- [[isolated-concept]] — 0 inbound links

### stale-source
- src-003 (raw/outdated-article.md) — hash changed since last compile

### sparse-article
- [[thin-concept]] — 45 words (threshold: 100)

## Info

### contradiction (--deep only)
- [[article-a]] vs [[article-b]]: conflicting claims about X
```

## Skipped Rules

Rules listed in `forge.yaml lint.ignore_rules` are skipped entirely.

When running without obsidian-cli, orphan-article runs in approximate mode. The report notes:
```
⚠️ Running without obsidian-cli. Orphan detection is approximate (alias references not resolved).
```
