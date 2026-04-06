# Evolution Strategies

This document defines how `/forge evolve` proactively improves the knowledge base.

## Gap Analysis

Evolve identifies four types of gaps:

### 1. Red Links (highest priority)

Wikilinks pointing to non-existent articles. These indicate concepts referenced by compiled articles but not yet documented.

**Detection**:
1. Run `<skill-base>/scripts/lint_wikilinks.js <wiki_dir>` to find all broken wikilinks
2. Count inbound references for each missing target (how many articles link to it)
3. Rank by inbound count — most-referenced gaps first

**Resolution**:
- Read source articles that reference the missing concept
- If raw sources contain relevant information → create a compiled article
- If insufficient information → create a stub article
- If the wikilink was a typo → fix the wikilink in the referring article

### 2. Stub Articles

Articles with `kind: stub` or word count below `lint.sparse_threshold`.

**Detection**: Read `_manifest.yaml`, filter articles where `kind == "stub"` or `word_count < threshold`.

**Resolution**:
- Re-read the original raw sources (`compiled_from` in manifest)
- Extract additional detail not captured in the first compile pass
- If sources are exhausted → suggest user ingest more material on this topic
- Update article kind from `stub` to `compiled` after expansion

### 3. Isolated Clusters

Groups of articles with no cross-links between them. Indicates topics that should be connected but aren't.

**Detection**:
1. Build a reference graph: article → set of outbound wikilinks
2. Find connected components in the undirected graph
3. Components with only 1-2 articles that share tags with larger clusters are isolation candidates

With obsidian-cli: use `obsidian backlinks` for precise bidirectional graph.
Without: Grep extraction of `[[wikilinks]]` from all articles.

**Resolution**:
- Read articles from isolated clusters
- Identify conceptual bridges (shared concepts, related topics)
- Add cross-references where genuinely relevant (don't force connections)
- Update `auto_crossrefs` in manifest

### 4. Duplicate Concepts

Articles covering substantially the same topic.

**Detection**: From lint `duplicate-concept` findings (Jaccard similarity > 0.7 on outbound wikilinks).

**Resolution — Merge Strategy**:
1. Determine primary article: the one with older `created` date keeps its id
2. Merge content: combine unique information from both into the primary
3. Convert secondary to redirect:
   - Replace body with: `See [[primary-id]]`
   - Set `kind: redirect`
   - Add secondary's title to primary's `aliases`
4. Update all wikilinks across the wiki: replace `[[secondary-id]]` with `[[primary-id]]`
5. Update manifest accordingly

## Execution Flow

1. **Run lint** to get current health status
2. **Collect gaps** from all four categories
3. **Prioritize**:
   - Red links with 3+ inbound references → critical
   - Stubs from frequently-referenced articles → high
   - Isolated clusters → medium
   - Duplicates → medium
   - Red links with 1 inbound reference → low
4. **Present plan to user** (if `evolve.require_confirmation: true`):
   ```
   Found {N} improvement opportunities:
   
   Critical:
   - Create article for [[missing-concept]] (referenced by 5 articles)
   
   High:
   - Expand stub [[thin-article]] (referenced by 3 articles)
   
   Medium:
   - Connect cluster {A, B} with cluster {C, D, E} via shared topic X
   - Merge [[duplicate-1]] into [[original]] (87% overlap)
   
   Proceed with all? Or select specific items.
   ```
5. **Execute** approved items (up to `evolve.max_changes_per_run`)
6. **Update manifest** and regenerate `wiki/_index.md`
7. **Output evolution report**:
   ```
   Evolution complete:
   - 2 articles created (filled red links)
   - 1 stub expanded to full article
   - 3 cross-references added
   - 1 duplicate merged
   ```

## Safety Rules

- **Never delete articles** — only change kind to redirect or orphaned
- **Never modify articles with kind: research** — those are query outputs, not compilation products
- **Respect max_changes_per_run** — don't batch too many changes, let user review incrementally
- **Preserve all existing wikilinks** — only add new ones, never remove
- **Log all changes** — every modification should be traceable in manifest timestamps
