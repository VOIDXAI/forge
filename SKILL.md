---
name: forge
description: >
  Forge compiles raw research into a self-maintaining Obsidian wiki with
  cross-references — an LLM research librarian that ingests, compiles, queries,
  lints, and evolves a structured knowledge base. Use this skill for ANY of
  these: /forge commands, building or querying a knowledge base, compiling raw
  research or notes into wiki articles, linting or health-checking a wiki
  (broken links, orphans, stale content), organizing research papers into a
  searchable cross-referenced collection, ingesting URLs or files into a KB,
  or maintaining/evolving wiki content. MUST trigger when user says "forge",
  "knowledge base", "compile notes", "compile research", "lint wiki",
  "health check wiki", "organize papers", "add to my wiki", "what does my KB
  say about", "evolve wiki", or wants to turn scattered sources into structured
  interlinked articles. NOT for: general Obsidian vault setup, personal
  note-taking, individual markdown files, .canvas files, Dataview queries,
  or code grep tasks.
---

# Forge — LLM-Managed Knowledge Base

Forge implements Karpathy's "LLM Knowledge Base" method: the LLM acts as a research librarian that compiles raw sources into a structured, interlinked Markdown wiki. The human feeds raw material and asks questions. The LLM handles everything else.

**Core rule**: The human never edits `wiki/` directly. The LLM is the sole maintainer.

## Directory Structure

```
<forge-root>/
├── forge.yaml              # configuration
├── _manifest.yaml          # compilation state — DO NOT EDIT
├── raw/                    # drop source materials here
│   ├── assets/             # locally downloaded images (Web Clipper)
│   └── *.md                # ingested sources with frontmatter
└── wiki/                   # LLM-maintained wiki — DO NOT EDIT
    ├── _index.md           # auto-generated table of contents
    ├── _lint-report.md     # latest lint results
    ├── _log.md             # append-only chronological change log
    ├── slides/             # Marp slide decks (from /forge export --marp)
    └── *.md                # compiled articles
```

## Optional Enhancements

Forge works with built-in tools only (Read/Write/Glob/Grep/WebFetch). These optional tools enhance the experience:

- **obsidian-cli**: Indexing, backlinks, vault-aware search. Detect: `which obsidian`
- **defuddle**: Cleaner web extraction. Detect: `which defuddle`
- **qmd**: Semantic search (BM25 + vector + LLM re-ranking). Detect: `which qmd`
- **Marp**: Slide deck export. Detect: `which marp`. See `references/marp-setup.md`
- **Obsidian Web Clipper**: Manual web-to-markdown with images. See `references/web-clipper-setup.md`

## Configuration (forge.yaml)

```yaml
name: "My Knowledge Base"
paths:
  root: "forge"           # relative to cwd or vault
  raw: "raw"              # relative to root
  wiki: "wiki"            # relative to root
compilation:
  parallel: false         # use subagents for parallel compilation
  article_style: detailed # detailed | concise | academic
  auto_crossref: true
query:
  default_depth: quick    # quick | standard | deep
  max_web_sources: 3
lint:
  ignore_rules: []
  sparse_threshold: 100
evolve:
  require_confirmation: true
  max_changes_per_run: 20
```

## Commands

### /forge init

1. Detect forge root (obsidian-cli → vault path, otherwise cwd)
2. Ask user for KB name (default: "forge")
3. Run `<skill-base>/scripts/scaffold.js <root_path> <kb_name>` (where `<skill-base>` is the "Base directory for this skill" provided at the top of the skill prompt)
4. Confirm created paths

### /forge ingest <url|path>

**URL mode**: defuddle (or WebFetch fallback) → generate source_id → compute content_hash → write to `raw/` with frontmatter → update manifest → append log: `## [YYYY-MM-DD] ingest | "{title}" → raw/{slug}.md`

**Local file mode**: read file (.md/.txt/.pdf) → generate source_id → write to `raw/` → update manifest → append log

**Web Clipper**: Users can also clip web pages (with images) into `raw/` manually. See `references/web-clipper-setup.md`. Compile detects new files automatically.

### /forge compile

Read `references/compilation.md` for the full protocol. Summary:

1. Read config + manifest, compute content hashes for all raw files
2. Diff: detect new / changed / renamed / deleted sources
3. Compile each new/changed source → create or update wiki articles
4. Cross-reference pass: add `[[wikilinks]]` across articles (qmd > obsidian-cli > Grep)
5. Update manifest, regenerate `_index.md`, append log: `## [YYYY-MM-DD] compile | N sources → M created, K updated`

**Parallel mode** (`compilation.parallel: true`): spawn one subagent per source. See `agents/compiler.md`.

### /forge query <question>

**Quick** (default): search wiki (qmd > obsidian-cli > Grep) → read top 3-5 articles → synthesize answer with `[[wikilinks]]`

**Standard** (`--standard`): Quick + fetch 1-2 web sources if wiki coverage is thin → suggest ingesting them

**Deep** (`--deep`): spawn researcher subagent → wiki + web research → write report to `wiki/research-{slug}.md`. See `agents/researcher.md`.

**Result persistence**: Good answers compound in the knowledge base. After answering any query (including quick/standard), if the response contains valuable analysis, comparisons, or newly discovered connections → ask user: "Save this analysis to wiki?" → if yes, write to `wiki/{slug}.md` (kind: `research`), update manifest + log.

### /forge lint

Read `references/lint-rules.md` for the full ruleset. Summary:

- **Fast**: broken wikilinks, missing frontmatter, sparse articles, stale sources
- **Backlinks** (degraded without obsidian-cli): orphan detection
- **Semantic** (`--deep`): contradictions, duplicate concepts

Output → `wiki/_lint-report.md`

### /forge evolve

Read `references/evolution.md` for strategies. Summary:

1. Run lint → gap analysis (red links, stubs, isolated clusters, duplicates)
2. Prioritize by impact → present plan to user (if `require_confirmation`)
3. Execute: fill red links, expand stubs, add cross-refs, merge duplicates
4. Update manifest + index, append log: `## [YYYY-MM-DD] evolve | {summary}`

### /forge export --marp <article-id|tag|all>

Generate Marp slide decks from wiki articles. Read `references/marp-setup.md` for full workflow + style template.

## Formatting Rules

Read `references/formatting.md` for the complete spec (article template, wikilinks, callouts, Dataview compatibility). Key rules:
- `[[wikilinks]]` for internal, `[text](url)` for external
- YAML frontmatter on every article
- All articles Dataview-compatible

## References

- Article identity, kinds, source schema, compilation: `references/compilation.md`
- Formatting spec + article template: `references/formatting.md`
- Lint ruleset: `references/lint-rules.md`
- Evolution strategies: `references/evolution.md`
- Compiler subagent: `agents/compiler.md`
- Researcher subagent: `agents/researcher.md`
- Marp setup: `references/marp-setup.md`
- Web Clipper setup: `references/web-clipper-setup.md`
