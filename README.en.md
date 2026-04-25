> Language / 言語: **English** | [中文](./README.zh.md) | [日本語](./README.ja.md)

# MD2POST

**Enterprise-grade Markdown to Long Image Rendering Engine · Agent Skill**

> This project is in an early validation stage and has not been fully tested. Community testing, improvement, and adaptation to your own use cases are welcome.

---

## Project Background

As AI-assisted content creation becomes increasingly prevalent, large language models can generate high-quality content — but converting "text" into "high-resolution long images suitable for social media distribution" involves complex typesetting and formatting engineering.

MD2POST was born from this challenge: to build a **deterministic, high-precision, zero-human-intervention** rendering engine that AI Agents can call directly, automatically transforming organized Markdown content into long images conforming to distribution standards for X/Twitter, Weibo, and similar platforms.

The design philosophy is "brain-muscle division of labor": the large model handles content decisions, and MD2POST handles deterministic physical typesetting execution.

---

## Key Features

### Two-Stage Capacity Fuse Mechanism
The engine has two independent defensive layers:
- **Phase 1 (Millisecond Estimation)**: At the AST parsing stage, a conservative height estimation algorithm rapidly scans the full document. If the platform pixel limit is predicted to be exceeded, the request is rejected immediately without launching the expensive browser.
- **Phase 2 (Precise Fuse)**: After real Chromium rendering, the actual DOM physical height is read for a second confirmation.

### Semantics-Aware Smart Slicing Algorithm
When content is too long and needs to be split into multiple images, the engine does not simply "bisect" content by pixel height. It injects JS probes into the headless browser to obtain precise coordinates of all DOM elements, and cuts at "safe gaps" — before headings, between paragraph spaces — ensuring text is never cut in the middle.

### Oversized Element Deadlock Resolution
For extreme cases where super-large elements (massive inserted images, large tables) make slicing impossible within the intended space, the engine implements a three-tier fallback strategy: upward retreat → downward extension → forced hard cut, ensuring the pipeline never deadlocks.

### Backend Synchronous Mermaid Rendering
For Mermaid flow charts, the engine synchronously calls `beautiful-mermaid` at the AST parsing stage to generate high-fidelity SVG vector images — avoiding race conditions from asynchronous front-end rendering, and naturally inheriting the long image's theme color scheme.

### Three Precision-Tuned Visual Themes
Three complete visual themes are built in via a CSS Design Token system. Agents only need to pass one parameter to switch the entire color scheme.

### Strict Image Safety Policy
- HTTP remote images are prohibited (prevents pipeline delays/stalls from network I/O)
- "Shrink only, never enlarge" principle for image sizing
- Millisecond-level image header reading via `image-size` for pixel-precise height estimation

---

## Supported Markdown Syntax

| Category | Support Status |
|---------|--------------|
| Headings H1-H6 | Full support with precision-tuned font sizes and spacing |
| Ordered / Unordered lists, indentation | Full support |
| Bold, italic, strikethrough | Full support |
| Inline code, code blocks | Full support (monospace font + dark background) |
| Tables | Full support (with header background color) |
| Blockquotes | Full support (with left decorative bar) |
| Local images (relative paths) | Full support |
| `==highlight==` | Supported (`markdown-it-mark`) |
| `^superscript^` / `~subscript~` | Supported (`markdown-it-sup` / `markdown-it-sub`) |
| `- [ ] task list` | Supported (`markdown-it-task-lists`), with rounded-corner checkboxes |
| Mermaid flow charts | Supported (`beautiful-mermaid`), backend synchronous SVG |

---

## Quick Start

### 1. Install Dependencies

```bash
cd MD2POST
npm install
npx playwright install chromium
```

### 2. Run

```bash
npx tsx src/index.ts -i ./example.md -t tech -l en
```

The project includes an [example file](./example.md) covering all advanced features including Mermaid diagrams, task lists, highlights, and tables. For complete parameter documentation, see **[SKILL.en.md](./SKILL.en.md)** (Agent-specific interface documentation).

### 3. View Output

Generated images will appear in the `./out/` directory. `debug_phase1.html` can be opened in a browser to preview the typesetting result.

---

## Document Index

| Document | Target Audience | Description |
|---------|----------------|-------------|
| **[SKILL.en.md](./SKILL.en.md)** | AI Agent | Complete call interface specification, parameter table, error handling, integration guide |
| **[Typography Best Practices](./docs/best-practices.en.md)** | Developers / Agent | Defines typesetting rules: font sizes, color schemes, slicing strategy |
| **[Technical Architecture](./docs/architecture.en.md)** | Developers | Technical explanation of rendering pipeline, fuse mechanisms, and semantic slicing algorithm |

---

## Testing Status

This project is currently in **prototype validation stage**. Core rendering pipeline end-to-end debugging is complete, but the following areas have not been fully tested:

- Edge case coverage with large volumes of real-world content
- Cross-OS (Linux / Windows) compatibility
- Typesetting for languages other than Chinese, Japanese, and English
- Rendering quality for more Mermaid diagram types
- Performance under extreme conditions (e.g., 64MB+ PNG output)

**Testing, issue submissions, and modifications to fit your own use cases are all welcome.** The engine's design is fully open, and all core algorithms have detailed comments.

---

## Acknowledgements

This project's implementation depends on the following excellent open-source projects:

| Library | Purpose | Link |
|---------|---------|------|
| **Playwright** | Headless Chromium automation, drives high-precision screenshots | [microsoft/playwright](https://github.com/microsoft/playwright) |
| **Sharp** | High-performance Node.js image processing, handles PNG slice export | [lovell/sharp](https://github.com/lovell/sharp) |
| **markdown-it** | High-quality Markdown parser, the AST foundation of the project | [markdown-it/markdown-it](https://github.com/markdown-it/markdown-it) |
| **beautiful-mermaid** | Zero-dependency, synchronous, highly customizable Mermaid SVG renderer | [lukilabs/beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) |
| **markdown-it-mark** | `==highlight==` syntax extension | [markdown-it/markdown-it-mark](https://github.com/markdown-it/markdown-it-mark) |
| **markdown-it-sup** | `^superscript^` syntax extension | [markdown-it/markdown-it-sup](https://github.com/markdown-it/markdown-it-sup) |
| **markdown-it-sub** | `~subscript~` syntax extension | [markdown-it/markdown-it-sub](https://github.com/markdown-it/markdown-it-sub) |
| **markdown-it-task-lists** | `- [ ]` task list syntax extension | [revin/markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists) |
| **image-size** | Millisecond-level image header reading without full decode | [image-size/image-size](https://github.com/image-size/image-size) |
| **Commander.js** | CLI parameter parsing | [tj/commander.js](https://github.com/tj/commander.js) |
| **Zod** | TypeScript-first runtime parameter validation | [colinhacks/zod](https://github.com/colinhacks/zod) |

---

## License

MIT
