# Obsidian-Compatible Markdown Formatting

Self-contained formatting reference for forge wiki articles. Follows Obsidian Flavored Markdown.

## Article Template

Every wiki article follows this structure:

```markdown
---
title: "Concept Name"
id: concept-name
kind: compiled
aliases:
  - "Alternative Name"
compiled_from:
  - src-001
tags:
  - domain
  - topic
created: 2026-04-05
updated: 2026-04-05
---

# Concept Name

Brief summary of the concept (2-3 sentences).

## Key Points

- Point 1 with [[wikilink-to-related]]
- Point 2

## Details

Extended explanation with cross-references to [[other-articles]].

## Sources

- [[raw/source-file|Source Title]]

## Related

- [[related-article-1]]
- [[related-article-2]]
```

## Frontmatter (YAML)

Every article starts with YAML frontmatter:

```yaml
---
title: "Article Title"
id: article-id
kind: compiled
aliases:
  - "Alternative Name"
compiled_from:
  - src-001
tags:
  - domain
  - topic
created: 2026-04-05
updated: 2026-04-05
---
```

## Internal Links (Wikilinks)

Use wikilinks for ALL internal references:

```markdown
[[article-id]]                     Link to article
[[article-id|Display Text]]        Custom display text
[[article-id#Heading]]             Link to heading
[[#Heading in same note]]          Same-note heading link
```

**Rules**:
- Always use the article's `id` (slug), never title or alias
- Use `|Display Text` when the id isn't human-readable in context
- For source references: `[[raw/source-file|Source Title]]`

## External Links

Standard markdown for external URLs only:

```markdown
[Link Text](https://example.com)
```

Never use markdown links for internal wiki references.

## Callouts

```markdown
> [!note]
> General information.

> [!warning] Custom Title
> Important warning.

> [!source]
> Source attribution or citation.

> [!tip]
> Helpful suggestion.
```

Common types: `note`, `tip`, `warning`, `info`, `example`, `quote`, `bug`, `danger`, `success`, `failure`, `question`, `abstract`, `todo`, `source`.

Foldable callouts:
```markdown
> [!faq]- Collapsed by default
> Content here.
```

## Tags

```markdown
#tag                    Inline tag
#nested/tag             Nested hierarchy
```

Tags in frontmatter are preferred over inline tags for forge articles.

## Embeds

```markdown
![[article-id]]                    Embed full article
![[article-id#Section]]            Embed section
![[image.png]]                     Embed image
![[image.png|300]]                 Image with width
```

## Highlighting

```markdown
==Highlighted text==
```

## Math

```markdown
Inline: $e^{i\pi} + 1 = 0$

Block:
$$
\frac{a}{b} = c
$$
```

## Code Blocks

Standard fenced code blocks with language identifier:

````markdown
```python
def hello():
    print("world")
```
````

## Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## Comments

```markdown
%%This is hidden in reading view%%

%%
Multi-line hidden block.
%%
```

## Dataview Compatibility

All frontmatter fields are queryable. Example Dataview query for forge articles:

```dataview
TABLE title, kind, tags, updated
FROM "forge/wiki"
WHERE kind = "compiled"
SORT updated DESC
```
