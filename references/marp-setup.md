# Marp Slide Deck Export

## Installation

Two options (either works):
- **CLI**: `npm i -g @marp-team/marp-cli`
- **Obsidian plugin**: Settings → Community plugins → Browse → "Marp Slides" → Install → Enable

Detect: `which marp`

## `/forge export --marp` Workflow

1. Check Marp availability. If unavailable: `⚠️ Marp not found. Install via npm (npm i -g @marp-team/marp-cli) or Obsidian Marp Slides plugin.`
2. Read target article(s):
   - Single: `--marp attention-mechanism`
   - By tag: `--marp tag:transformers`
   - All: `--marp all`
3. For each article, generate a Marp-formatted markdown slide deck:
   - Title slide from article title + summary
   - One slide per `## Key Points` bullet
   - Detail slides from `## Details` sections
   - Sources slide at the end
   - Use `---` slide separators, Marp frontmatter (`marp: true`, theme)
4. Write to `wiki/slides/{article-id}.md`
5. Append to `wiki/_log.md`: `- [{timestamp}] **export**: marp slides for {article-id(s)}`
6. Output: "Generated slides → wiki/slides/{filename}.md"

## Rendering

After generating the Marp markdown, render to HTML/PDF:

```bash
# HTML (lightweight, interactive — arrow keys to navigate)
marp wiki/slides/{article-id}.md -o wiki/slides/{article-id}.html

# PDF (for sharing)
marp wiki/slides/{article-id}.md -o wiki/slides/{article-id}.pdf --allow-local-files
```

In Obsidian with Marp Slides plugin: open the `.md` file and use the plugin's preview/export.

## Slide Style Template

```yaml
---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: #F8F7F5;
    color: #2F3542;
  }
  h1, h2 { color: #007AFF; }
  strong { color: #007AFF; }
---
```

Adapt theme and colors to match the article's domain. Use `<!-- _class: lead -->` for title/end slides.
