> Language / 言語: **English** | [中文](./SKILL.zh.md) | [日本語](./SKILL.ja.md)

---
name: md2post
description: Personal-grade Markdown to Long Image Rendering Engine. Given a Markdown file, automatically completes the full pipeline of "semantic slicing → headless browser precise rasterization → segmented PNG export", outputting high-definition long images conforming to size constraints for X/Twitter, Weibo, and similar platforms.
---

# MD2POST — Skill Reference (For AI Agents)

> This document is designed to be read by AI Agents. The goal is to enable any mainstream model framework (including Codex, Claude Code, Open Code, Gemini CLI, Antigravity, Trae, etc.) to independently complete environment setup, execution, and integration.

---

## I. Skill Purpose

MD2POST is a **"muscle-type" deterministic execution tool** with a very clear scope:

- **Input**: A local `.md` file path + optional theme and language parameters
- **Output**: One or more high-definition PNG long images, saved to the specified output directory

The Agent's responsibility is to prepare the input file and call this tool; MD2POST's responsibility is to deterministically complete the full conversion from text to image, requiring no external APIs and no network permissions.

---

## II. System Prerequisites

Before calling this skill, ensure the host machine meets the following requirements:

| Dependency | Version Requirement | Notes |
|------------|--------------------|----|
| **Node.js** | ≥ 18 LTS | Must support ESM (`"type": "module"`) |
| **npm** | ≥ 9 | For installing dependencies |
| **Chromium or Chrome** | Managed automatically by Playwright | Used for headless browser screenshots |

---

## III. Installation Steps (First-Time Setup)

Execute the following commands in order. Wait for each command to complete successfully before proceeding.

### Step 1: Install Node Dependencies

```bash
npm install
```

### Step 2: Install Playwright's Headless Browser Core

This step downloads Chromium, requiring approximately 200MB of disk space and network connectivity.

```bash
npx playwright install chromium
```

### Step 3: Verify Installation

```bash
npx tsx src/index.ts --help
```

If parameter documentation is printed, the environment is ready.

### Step 4: Build Vendor Module (beautiful-mermaid fork)

This project includes a local fork of `beautiful-mermaid` with Issue #83 fix ( TD/TB layout flipping bug). Build it:

```bash
cd vendor/beautiful-mermaid
npm install
npm run build
cd ../..
```

---

## IV. CLI Interface

### Basic Format

```bash
npx tsx src/index.ts -i <input_file> [options]
```

### Full Parameter Table

| Parameter | Short | Required | Default | Valid Values | Description |
|-----------|-------|----------|---------|--------------|-------------|
| `--input` | `-i` | Yes | — | Any `.md` file path | Input Markdown file (relative or absolute path) |
| `--output` | `-o` | No | `./out` | Any directory path | Output directory (auto-created) |
| `--theme` | `-t` | No | `humanities` | `tech` / `humanities` / `emotion` | Visual style theme |
| `--lang` | `-l` | No | `zh` | `zh` / `ja` / `en` | Base language (affects font size and typesetting density) |

### Usage Examples

```bash
# Minimal call (using default theme and language)
npx tsx src/index.ts -i ./my_article.md

# Specify blue tech theme + English
npx tsx src/index.ts -i ./report.md -t tech -l en -o ./output

# Specify emotion theme + Japanese
npx tsx src/index.ts -i ./post.md -t emotion -l ja
```

---

## V. Three Themes Explained

| Theme ID | Name | Style Description | Best For |
|----------|------|------------------|----------|
| `tech` | Tech | Cool white background + blue-purple highlights | Technical sharing, product analysis |
| `humanities` | Humanities | Creamy warm white + red-ochre accents | Book reviews, essays, humanities content |
| `emotion` | Emotion | Dark background + gold highlights | Reflections, poetry, emotional content |

---

## VI. Supported Markdown Syntax

The following syntax is fully supported and visually tuned in this engine:

**Standard Syntax**
- Ordered / unordered lists, nested indentation
- Bold, italic, strikethrough
- Inline code, code blocks (with syntax-highlighted container)
- Blockquotes
- Tables
- Images (**local relative paths only** — HTTP remote images are prohibited)
- Horizontal rules `---`

**Extended Syntax** (via official plugins)
- `==highlighted text==` — Gold rounded-corner highlight marks
- `^superscript^` / `~subscript~` — Precisely baseline-aligned superscripts and subscripts
- `- [ ] incomplete` / `- [x] complete` — Rounded-corner Checkbox task lists

**Mermaid Diagrams**
- Use `` ```mermaid `` in a code block.
- The engine synchronously calls `beautiful-mermaid` during the AST phase to compile a high-fidelity SVG vector image, with no rendering delay and no lossy scaling.
- Supported types: `graph TD/LR`, `flowchart`, `stateDiagram-v2`, `sequenceDiagram`, `classDiagram`, `erDiagram`, and other mainstream types.
- **Note**: Do not add semicolons to Mermaid syntax headers (e.g., `graph TD;` is invalid — use `graph TD`).

---

## VII. Output Description

After successful execution, the output directory will contain:

| Filename | Description |
|----------|-------------|
| `debug_phase1.html` | Preview HTML file (open in browser to verify typesetting) |
| `post.png` | Single output image when content height ≤ 8000px |
| `post_1of3.png` etc. | Segmented images when content exceeds 8000px, sliced at semantic safe points |

---

## VIII. Capacity Limits and Error Handling

| Situation | Trigger Condition | Engine Behavior |
|-----------|------------------|----------------|
| Normal | Estimated height < 24000px | Normal rendering |
| Warning | Estimated height 24000–32000px | Prints `[WARNING]`, activates multi-image slicing mode, continues execution |
| Fatal Error | Estimated height > 32000px | Prints `[CAPACITY_EXCEEDED]` and terminates, suggests character reduction amount |
| Remote Image | Markdown contains `http://` or `https://` image | Immediately errors and terminates — network requests are prohibited |

---

## IX. Agent Integration Guidelines

1. **Pre-generate content**: The Agent can first organize user content into standard Markdown, write it to a temporary file, then call this tool.
2. **Parameter decisions**: Theme (`--theme`) and language (`--lang`) are the only parameters Agents are allowed to pass dynamically. All typesetting rules (font sizes, line heights, spacing) are fixed inside the engine — Agents cannot override them.
3. **Image references**: If content contains illustrations, ensure image files are already written locally with relative paths, and correctly referenced in Markdown (e.g., `![description](./images/chart.png)`).
4. **Error recovery**: If `[CAPACITY_EXCEEDED]` occurs, the Agent should automatically split the original text into segments and call this tool multiple times to generate multiple image groups.

---

## X. Reference Materials (Knowledge Base)

The following two documents are the underlying design basis of this skill. Consult them first when questions arise:

- **[Typography Best Practices](./docs/best-practices.en.md)**: Defines typesetting rules including font size systems, color themes, oversized element fallback strategies, and multi-image slicing strategy — the visual specification for engine behavior.
- **[Technical Architecture](./docs/architecture.en.md)**: Defines the two-stage capacity fuse mechanism, semantic slicing algorithm principles, Mermaid intercept pipeline, and other core technical decisions.
