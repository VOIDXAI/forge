# forge

A Claude Code skill that turns raw research into a self-maintaining Obsidian wiki with cross-references. Implements [Karpathy's LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern: the LLM acts as a research librarian that ingests, compiles, queries, lints, and evolves a structured knowledge base.

You feed raw material. The LLM handles summarizing, cross-referencing, filing, and maintenance.

## Install

Copy the skill into your Claude Code skills directory:

```bash
git clone https://github.com/VOIDXAI/forge.git ~/.claude/skills/forge
```

Or add as a git submodule in an existing skills collection.

## Commands

| Command | What it does |
|---------|-------------|
| `/forge init` | Initialize a new knowledge base |
| `/forge ingest <url\|path>` | Ingest a source (URL, local file, or Web Clipper) |
| `/forge compile` | Compile raw sources into wiki articles |
| `/forge query <question>` | Query the knowledge base (quick / standard / deep) |
| `/forge lint` | Health check: broken links, orphans, stale sources |
| `/forge evolve` | Auto-improve: fill gaps, expand stubs, merge duplicates |
| `/forge export --marp <id>` | Generate Marp slide decks from wiki articles |

## Directory Structure

After `/forge init`, your knowledge base looks like:

```
forge/
├── forge.yaml          # configuration
├── _manifest.yaml      # compilation state
├── raw/                # drop source materials here
│   ├── assets/         # locally downloaded images
│   └── *.md            # ingested sources
└── wiki/               # LLM-maintained wiki (do not edit)
    ├── _index.md       # auto-generated table of contents
    ├── _lint-report.md # lint results
    ├── _log.md         # change log
    ├── slides/         # Marp slide decks
    └── *.md            # compiled articles
```

## Optional Enhancements

Forge works with built-in Claude Code tools only. These optional tools improve the experience:

- **[obsidian-cli](https://github.com/nicosommi/obsidian-cli)** — vault-aware search, backlinks
- **[defuddle](https://github.com/nicosommi/defuddle)** — cleaner web extraction
- **[qmd](https://github.com/qmdnl/qmd)** — semantic search (BM25 + vector + LLM re-ranking)
- **[Marp](https://marp.app/)** — slide deck rendering (`npm i -g @marp-team/marp-cli`)
- **Obsidian Web Clipper** — browser extension for manual web-to-markdown with images

## How It Works

1. **Ingest**: Drop sources into `raw/` (via URL, file, or Web Clipper)
2. **Compile**: LLM reads sources, extracts concepts, creates interlinked wiki articles with `[[wikilinks]]`
3. **Query**: Search the wiki semantically, synthesize answers with citations
4. **Lint**: Detect broken links, orphaned pages, stale content, contradictions
5. **Evolve**: Auto-fill knowledge gaps, expand stubs, merge duplicates, add cross-references

The wiki is a persistent, compounding artifact. Knowledge compiles once, stays current through maintenance.

## License

[MIT](LICENSE)
