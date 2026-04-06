# Obsidian Web Clipper Setup for Forge

## Installation

1. Browser extension store search "Obsidian Web Clipper", install

## Configure Default Save Location (one-time)

1. Browser toolbar → click Web Clipper icon → bottom gear icon → Settings
2. **Templates** → edit default template (or create new one named "Forge")
3. **Folder** field → `forge/raw` (relative to vault root)
4. Save template

After this, every clip automatically saves to `raw/`.

## Configure Local Image Downloads (one-time)

1. Obsidian → Settings → **Files and links** → **Default location for new attachments** → "In the folder specified below" → fill `forge/raw/assets`
2. Obsidian → Settings → **Hotkeys** → search `Download` → find **"Download all remote images"** → bind `Ctrl+Shift+D`

## Usage Workflow

1. Browser: see an article → click Web Clipper icon → **Add to Obsidian** → saves to `raw/`
2. Obsidian: open the clipped file → press `Ctrl+Shift+D` → all images download to `raw/assets/`, links auto-rewrite to local paths
3. Claude Code: `/forge compile` → new file detected and compiled

## Notes

- Web Clipper files won't have forge's source frontmatter (`source_id`, `content_hash`, etc.). The compiler treats them as new sources and adds frontmatter during compilation.
- **Image handling during compilation**: LLMs cannot read markdown with inline images in one pass. The compiler reads the text first, then reads referenced images separately via the Read tool to extract visual context (diagrams, figures, charts), and merges both into the compiled article.
- Web Clipper is preferred over `/forge ingest <url>` when the page has important images, requires authentication, or needs JavaScript rendering.
