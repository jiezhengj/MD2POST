> Language / 言語: **English** | [中文](./architecture.zh.md) | [日本語](./architecture.ja.md)

# MD2POST: Technical Architecture

> Status: In Development
> Last Updated: 2026-04-26
> Related Document: [Typography Best Practices](./best-practices.en.md)

---

## I. System Purpose and Core Requirements

MD2POST is positioned as a **highly deterministic, professional typesetting-grade** Markdown-to-long-image tool, designed specifically for social media distribution on X/Twitter, Weibo, and similar platforms.

**Core Technical Requirements:**
1. **Absolutely correct CJK typesetting**: Must natively support CJK kerning rules (punctuation compression, line-start/end folding restrictions).
2. **Pixel-level parameter control**: Strictly follows the Typography Best Practices to achieve precise rendering of character spacing, line height, and paragraph spacing.
3. **AI Native orchestration**: Agent handles non-destructive pre-decisioning (language detection, theme inference) without interfering with the deterministic rendering pipeline.
4. **Multi-image smart slicing**: Safe image slicing based on semantic boundaries, respecting social media platform capacity limits.

---

## II. Technology Stack Selection

Due to the complexity of CJK typesetting, the pure Canvas/Pango manual calculation approach was abandoned in favor of the **headless browser screenshot** golden pipeline.

| Module Layer | Technology | Selection Rationale |
|-------------|-----------|---------------------|
| **Core Language** | **TypeScript (Node.js)** | Richest front-end and browser automation ecosystem; type system guarantees parameter contracts |
| **AST Parsing** | **`markdown-it`** | Rich plugin ecosystem, easy to extend with footnotes, Ruby annotations, syntax highlighting |
| **Rendering Engine** | **Playwright** | Drives Headless Chromium; kernel has the most complete CJK word-wrapping algorithm; faster and more modern architecture than Puppeteer |
| **LLM Framework** | **Vercel AI SDK + Zod** | Used in Agent stage, enforces strictly Zod-validated JSON TypographyConfig output |
| **Image Post-Processing** | **`sharp`** | Highest-performance C++ image processing library for Node.js — handles final slicing, format optimization, and output |

---

## III. Rendering Pipeline Architecture

The system's core workflow is divided into two phases: "Pre-processing (Brain)" and "Rendering Execution (Muscle)", following the principle of "static-dynamic balance / determinism isolation".

### Phase One: Agent Intelligent Decision Engine

**Executor**: Large Language Model (e.g., Claude / GPT-4o)
**Responsibility**: Rapid classification of text properties, output of typesetting input parameter contract.

1. **Input extraction**: Capture the first 800 characters of the Markdown source file.
2. **Multi-dimensional detection**:
   - Detect primary language (determines base font size: Chinese 32px / Japanese 30px / English 28px).
   - Detect content type characteristics (Tech / Humanities / Emotion).
3. **Parameter generation**:
   - Assembled into JSON conforming to the `TypographyConfig` interface.
   - Mapped to three preset theme token sets (cool white / warm white / cream yellow).

### Phase Two: DOM Assembly and Pre-inspection (Two-Stage Fuse)

**Executor**: Node.js logic layer
**Responsibility**: Intercept anomalous requests to avoid wasteful end-to-end browser rendering overhead.

1. **Rough height estimation**:
   - Parse Markdown AST.
   - Estimate physical height by stacking line heights and natural paragraphs using the Best Practices height formula.
   - For images: use `image-size` to read local relative path image dimensions in real time. Follow the **"shrink only, never enlarge"** principle: proportionally reduce height when width exceeds 920px; use physical actual height otherwise.
   - **Intercept protocol**: If `http` / `https` network images are detected, immediately throw a fatal error and abort the pipeline.
   - **First-level fuse**: If total estimate exceeds 24000px, issue a capacity warning. If it exceeds 32000px, immediately fuse (`CAPACITY_EXCEEDED` error).
2. **HTML/CSS Assembly and Vector Mounting**:
   - Convert Markdown to HTML DOM. At this stage, four official plugins are loaded — `markdown-it-mark`, `markdown-it-sup`, `markdown-it-sub`, `markdown-it-task-lists` — enabling the engine to support advanced typesetting syntax including highlights, super/subscripts, and Checklist native states.
   - **Mermaid-specific intercept**: The engine uses `markdown-it`'s native `.renderer.rules.fence` rewrite algorithm. When a code block with `info === 'mermaid'` is detected, instead of pushing it into a dark code container, the local fork of `beautiful-mermaid` (located at `vendor/beautiful-mermaid/`) is called on-the-spot to compile a high-precision SVG vector image string with no rendering wait, which is seamlessly inserted into the DOM. This fork includes a **built-in ELK layout engine configuration** that forces flowchart vertical layout (TD/TB), completely fixing Issue #83 where TD/TB directives were ignored. `beautiful-mermaid` must be compiled with `npm run build:mermaid` before first use.
   - Inject CSS template containing Design Tokens, converting the Agent's output theme into `:root` variables (CSS Variables). The generated Mermaid SVG also naturally inherits the theme's color quality via `color-mix`-based variables (such as `bg` and `fg`).
   - CSS internally integrates visual design presets for all advanced features above (e.g., rounded checkboxes, precision-aligned superscripts, forced full-width SVG expansion algorithm).

### Phase Three: Rasterization and Physical Slicing

**Executor**: Playwright + Sharp
**Responsibility**: Full-page screenshot and semantic boundary-based physical cropping.

1. **Browser rendering and screenshot**:
   - Playwright opens a virtual page, loads local `Noto Fonts`.
   - Waits for all `<img>` resources to finish loading.
   - Executes `page.screenshot({ fullPage: true })` to obtain a full-page PNG memory buffer.
2. **Second-level fuse**:
   - Read actual screenshot height. If Height > 32000px, trigger the second-level precise fuse and destroy the task.
3. **Semantic slicing and oversized element fallback**:
   - If Height > 8000px, calculate number of tiles: `N = ceil(Height / 8000)`.
   - Use JS **DOM probing** in the Playwright environment (based on `getBoundingClientRect()`) to find `y` coordinates of H1/H2 elements and paragraph gaps.
   - Return optimal cut points `[y1, y2, ...]` to Node.
   - **Oversized Deadlock Resolution (Oversized Fallback)**: If a single massive element obscures the detection window, the system will preferentially retreat to cut at the element's upper boundary (resulting in a shorter tile). Only if the target breaks the platform's 10k hard limit will it trigger a coarse forced cut.
4. **Image output**:
   - `sharp(buffer).extract({ top, left, width, height })` outputs multiple `_1of3.png` final images based on the cut point array.

---

## IV. Core Data Contract (Schema Example)

The `TypographyConfig` generated by the Agent layer must be strictly constrained by the Zod Schema. This is the isolation wall between the dynamic and static worlds:

```typescript
// TypographyConfig Schema Contract
interface TypographyConfig {
  meta: {
    language: "zh-CN" | "ja" | "en";
    detectedType: "tech" | "humanities" | "emotion";
  };
  designTokens: {
    // Physical scaling factor values
    canvasWidth: 1080;
    baselineFontSize: number; // 32, 30, or 28

    // Theme color configuration strategy
    palette: {
      backgroundColor: string;
      primaryText: string;
      secondaryText: string;
      borderColor: string;
    };
  };
}
```

---

## V. Key Technical Challenges and Solutions

### 1. Cross-Platform System Font Consistency
- **Problem**: Default CJK fonts may be scattered or missing under Docker or different OS environments.
- **Solution**: Bundle `Noto Sans CJK` as a static asset in the project. In the browser, mount it via `@font-face` pointing directly to the local physical path, decoupling the dependency on the host machine's font environment.

### 2. Preventing Text Bisection During Long Image Slicing
- **Problem**: Simple proportional height-based image slicing will inevitably cut through text lines or images.
- **Solution**: Leverage Playwright's powerful environment advantages. Before `screenshot`, inject a probe script in the page via `page.evaluate`.
  - The script traverses all block-level DOM elements (`h1...h5, p, img, pre`).
  - Calculates their physical `top` and `bottom` coordinate ranges.
  - Within a ±15% window around the ideal cut point, finds the nearest element gap and sends that precise pixel Y coordinate to the outer `sharp` library for hardware-level division.

### 3. I/O Blocking Protection and Multi-Core Parallelism
- **Problem**: Under high-traffic requests, Playwright's environment startup/shutdown is heavy and time-consuming, prone to apparent freezing.
- **Solution**: Use `generic-pool` to maintain a small Browser Context connection pool. Strictly prevent injecting large text object code segments into Python/Node communication buffers (TTY); instead, use full-chain communication based on physical file paths at `/tmp/xxx`.

---

*This architecture establishes an enterprise-grade lossless pipeline built on "Agent lightweight decision-making + front-end hard checks + browser precision rendering + semantic coordinate cropping", thoroughly isolating the risk of typesetting collapse caused by LLM errors.*
