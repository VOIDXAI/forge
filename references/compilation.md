# Compilation Protocol

This document defines how forge compiles raw sources into wiki articles.

## Article Identity Rules

Every wiki article has a stable identity:

| Property | Rule |
|----------|------|
| `id` | Stable slug, immutable once created. Format: `[a-z0-9-]` only |
| Filename | `{id}.md` — 1:1 with id |
| `title` | Human-readable, mutable (evolve can improve) |
| `aliases` | Array of historical titles + concept aliases (Obsidian-native) |
| Wikilinks | Always use id: `[[attention-mechanism]]`, never title or alias |

**Slug generation**: `slugify(title)` → lowercase, hyphen-separated, `[a-z0-9-]` only.

**Slug conflict**: When multiple sources produce the same slug, allocate suffixes by `source_id` ascending order. First source gets the bare slug, others get `-2`, `-3`, etc. Suffix allocation is deterministic across reruns and based only on the sorted conflicting source_id set.

**Recompile guarantee**: compile never renames existing articles. Title changes → old title added to aliases, id unchanged. Only new concepts create new articles.

## Article Kinds

| Kind | Source | Behavior |
|------|--------|----------|
| `compiled` | `/forge compile` | Full lint + evolve |
| `research` | `/forge query --deep` | Lint but excluded from evolve duplicate detection |
| `stub` | Compile placeholder | Evolve prioritizes expansion |
| `redirect` | Evolve merge | Lint skips |
| `orphaned` | Source deleted | Lint reports, evolve suggests archive/delete |

## Source Frontmatter Schema

All ingested sources in `raw/` share this unified frontmatter:

```yaml
---
source_id: src-001              # matches _manifest.yaml key
title: "Article Title"
ingested_from: url              # url | local
source_url: "https://..."       # required if url, null if local
source_path: "/path/to/file"    # required if local, null if url
format: markdown                # markdown | pdf | text
content_hash: "sha256:..."     # body-only hash (excludes frontmatter)
ingested: "2026-04-05"
tags: []                        # optional user-specified tags
---
```

## _manifest.yaml Full Schema

```yaml
version: 1
last_compiled: "2026-04-05T10:30:00Z"    # ISO 8601

sources:
  src-001:                                 # source_id, auto-increment (src-NNN)
    path: "raw/filename.md"                # relative to forge root
    content_hash: "sha256:abc123..."       # body-only hash (excludes frontmatter)
    status: active                         # active | deleted
    ingested_from: url                     # url | local
    source_url: "https://..."              # required if url, null if local
    source_path: null                      # required if local, null if url
    format: markdown                       # markdown | pdf | text
    ingested: "2026-04-05"
    compiled_articles: []                  # list of article ids produced from this source
    last_compiled: "2026-04-05T10:30:00Z"

articles:
  article-id:                              # id = filename without .md, immutable
    title: "Human Readable Title"
    aliases: ["alt name 1", "alt name 2"]
    compiled_from: [src-001, src-002]      # source_ids that contributed
    kind: compiled                         # compiled | research | stub | redirect | orphaned
    auto_crossrefs: [other-article-id]     # cross-references added by forge (not from source)
    word_count: 850
    created: "2026-04-05"
    updated: "2026-04-05"
```

### Status Enums (exhaustive, no other values allowed)

```
source.status ∈ { active, deleted }
article.kind  ∈ { compiled, research, stub, redirect, orphaned }
```

### State Transitions

```
source:  active ──(file missing + no hash match)──→ deleted

article: compiled ──(all sources deleted)──→ orphaned
                  ──(evolve merge)──→ redirect
         stub ──(evolve expand)──→ compiled
         research (never transitions — stays research)
```

## Incremental Compilation Algorithm

### Step 1: Compute current state

Run `<skill-base>/scripts/hash_tracker.js bulk <raw_dir>` to get `{filename: content_hash}` for all raw files.

> **Note**: `<skill-base>` refers to the "Base directory for this skill" provided at the top of the skill prompt. This may differ from the forge project root.

### Step 2: Diff against manifest

For each source in manifest:
1. Check if `path` file still exists
2. If exists: compare content_hash
   - Same → skip (unchanged)
   - Different → mark for recompilation
3. If missing: check all NEW files (files in raw/ not in any manifest source path) for matching content_hash
   - **Match found → RENAME**: update source path in manifest, do NOT recompile. Frontmatter changes don't affect this — only body content_hash matters.
   - **No match → DELETED**: set `status: deleted`

For each file in raw/ not in manifest:
- This is a NEW source → mark for compilation

### Step 3: Handle deletions

For each source newly marked `deleted`:
- For each article_id in its `compiled_articles`:
  - Check if any OTHER active source also lists this article in its `compiled_articles`
  - If no active sources remain → set article kind to `orphaned`
  - Prepend warning callout to article body:
    ```
    > [!warning] Source deleted
    > The source material for this article has been removed. Content may be outdated.
    ```

### Step 4: Compile each new/changed source

For each source to compile:

1. **Read the raw source** (full content including frontmatter)
2. **Analyze content** — extract:
   - Key concepts (potential article topics)
   - Claims and facts
   - Named entities (people, systems, frameworks)
   - Relationships between concepts
3. **For each concept**, determine article action:
   - Check manifest `articles` for existing id matching `slugify(concept_title)`
   - **Exists** → READ the existing article, UPDATE with new information, preserve id and existing content structure
   - **New** → CREATE new article with generated slug id
   - **Ambiguous** (slug would conflict with existing article from different concept) → append suffix per slug conflict rules
4. **Write article** following the Article Template in SKILL.md
5. **Update manifest** source entry: set `compiled_articles`, update `content_hash`, `last_compiled`
6. **Update manifest** article entries: set `compiled_from`, `kind`, `word_count`, `updated`

### Step 5: Cross-reference pass

After all sources are compiled:

1. For each newly created/updated article:
   - Get its title and aliases
   - Search all OTHER wiki articles for mentions of these terms
   - With obsidian-cli: `obsidian search query="term"`
   - Without: `Grep` for term in wiki/ directory
2. For each match found:
   - If the mention is not already a wikilink → add `[[article-id]]` around the mention
   - Record in manifest article entry under `auto_crossrefs`
3. Also search the NEW article's body for mentions of existing article titles/aliases → add wikilinks

### Step 6: Update index

Regenerate `wiki/_index.md`:

```markdown
---
title: Knowledge Base Index
kind: index
---

# Knowledge Base Index

> Last compiled: {timestamp} | Articles: {count} | Sources: {source_count}

## Articles

### {Tag/Category Group}
- [[article-id]] — {one-line summary} *(sources: 3, updated: 2026-04-06)*
- [[another-id]] — {one-line summary} *(sources: 1, updated: 2026-04-05)*

### Stubs (need expansion)
- [[stub-id]] — ⚠️ stub *(sources: 1)*

### Research Reports
- [[research-id]] — 📊 {query summary} *(2026-04-06)*
```

## Article Writing Rules

1. **Frontmatter**: Every article must have complete YAML frontmatter per the template in `references/formatting.md`
2. **Wikilinks**: Use `[[article-id]]` for all internal references. Never use markdown links for internal.
3. **Source attribution**: Include `## Sources` section linking back to `[[raw/source-file|Title]]`
4. **Dataview compatibility**: All frontmatter fields must be valid YAML for Dataview queries
5. **Language**: Match the language of the source material. If sources are mixed, default to the language of the majority.
6. **Style**: Follow the `article_style` setting from forge.yaml:
   - `detailed`: Full explanations, examples, context (default)
   - `concise`: Key points only, minimal prose
   - `academic`: Formal tone, citations, structured sections
