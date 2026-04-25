> Language / 言語: **English** | [中文](./best-practices.zh.md) | [日本語](./best-practices.ja.md)

# Long Image Typography Best Practices

> Applicable platforms: X/Twitter (max 4 images per post), Weibo, and other social media
> Applicable languages: Chinese, Japanese, English
> Applicable scenarios: Mixed graphic long images (vertical layout only)
> Last updated: 2026-03-29

---

## Core Premise: Target Reading Context

The distribution chain for social media long images: **Original → Platform Compression → User Device Rendering**

- **X/Twitter**: Image width cap is approximately 1200px; phone display width is approximately 375–430pt
- **Weibo**: Original image cap is 20MB; phone display width is approximately 600–750px
- **Reader Devices**: Must accommodate both phone (primary) and desktop (secondary) reading environments

---

## I. Image Width

| Target Scenario | Recommended Width | Notes |
|-----------------|------------------|-------|
| Mobile-first (recommended) | **1080px** | Matches mainstream iPhone/Android 3x screens, no compression triggered, ample clarity |
| Desktop-compatible | **1200px** | X/Twitter lossless cap, suitable for widescreen display |
| Ultra-clarity | Not recommended > 1200px | X will compress to 1200px, Weibo also compresses — counterproductive |

**Conclusion: 1080px is the golden width**, balancing mobile native resolution with platform lossless transmission. For content primarily targeting PC readers, 1200px is acceptable.

---

## II. Body Font Size

Base canvas width: 1080px

| Language | Recommended Size | Notes |
|----------|-----------------|-------|
| **Chinese** | **32–36px** | High character density, heavy visual weight — larger size needed for comfortable reading |
| **Japanese** | **30–34px** | Mixed kana and kanji — kana is lighter, can be 1–2px smaller than Chinese |
| **English** | **28–32px** | Latin letters measured by x-height — Noto Sans is clear in this range |

> **Conversion Verification**: A 1080px image on a phone (375pt width) scales at approximately 2.88×, meaning a 32px image character ≈ ~11pt on the phone — approaching the comfortable reading threshold (≥10pt).

---

## III. Heading Font Size System

Uses a **Modular Scale** with a ratio range of **1.15–1.75**. Ratios that are too large will make headings appear jarring and bloated in long images.

Working backward from body text:

| Level | Multiplier | Chinese (base 32px) | Japanese (base 30px) | English (base 28px) |
|-------|-----------|--------------------|--------------------|---------------------|
| Body | 1× | 32px | 30px | 28px |
| H5 | 1.15× | **36px** | **34px** | **32px** |
| H4 | 1.25× | **40px** | **38px** | **35px** |
| H3 | 1.333× | **48px** | **44px** | **40px** |
| H2 | 1.5× | **56px** | **52px** | **48px** |
| H1 | 1.75× | **72px** | **64px** | **56px** |

> **Practical advice**: If there is no actual need for fifth-level headings in the long image, H4/H5 can be merged to avoid unclear hierarchy. Heading levels should not exceed 3.

---

## IV. Page Margins

At canvas width 1080px:

| Position | Recommended Value | Notes |
|----------|------------------|-------|
| **Left margin** | **80–96px** | Effective content width ~900px, maintaining ~8.3% white space ratio |
| **Right margin** | **80–96px** | Symmetric with left, prevents text touching edges |
| **Top margin** | **100–120px** | Accommodates branding or visual breathing room, prevents mobile screenshots from being cropped by system UI |
| **Bottom margin** | **80–100px** | Slightly smaller than top for visual stability |

Effective layout width: 1080 - 80×2 = **920px** (recommended), not exceeding 960px.

---

## V. Paragraph Spacing

| Scenario | Recommended Value | Notes |
|----------|-----------------|-------|
| **Body paragraph spacing** | **1.0–1.5× line height** (approx. 52–64px) | Ensures paragraph breathing room — especially important for Chinese |
| **After heading, before body** | **0.75× heading line height** | Visually binds heading to its subordinate content, showing hierarchy |
| **After body, before new heading** | **1.5–2× body line height** (approx. 80–96px) | Separates from content above, gives new heading breathing space |

---

## VI. Line Height

| Level | Line Height Ratio | Chinese actual (base 32px) | English actual (base 28px) |
|-------|------------------|---------------------------|---------------------------|
| Body | **1.7–1.8×** | 32×1.75 ≈ **56px** | 28×1.75 ≈ **49px** |
| H5 | **1.5×** | 36×1.5 = **54px** | 32×1.5 = **48px** |
| H4 | **1.5×** | 40×1.5 = **60px** | 35×1.5 ≈ **52px** |
| H3 | **1.4×** | 48×1.4 ≈ **67px** | 40×1.4 = **56px** |
| H2 | **1.3×** | 56×1.3 ≈ **73px** | 48×1.3 ≈ **62px** |
| H1 | **1.2–1.25×** | 72×1.25 = **90px** | 56×1.2 ≈ **67px** |

> **Chinese line height must be ≥1.7×**: Chinese characters have no descenders, so dense setting causes visual crowding. Line height is the primary parameter for comfortable Chinese reading.

---

## VII. Letter Spacing

| Language | Level | Recommended Spacing | Notes |
|----------|-------|--------------------|----|
| **Chinese** | Body | `0.05em` (~1.6px @ 32px) | Slight loosening reduces visual crowding from dense characters |
| **Chinese** | H1–H2 headings | `0.01–0.02em` | Larger heading fonts should not be too loose |
| **Japanese** | Body | `0.05em` | Similar treatment to Chinese |
| **Japanese** | Headings | `0–0.02em` | Depends on character density; more kana allows slightly looser |
| **English** | Body | `0` (default) | Noto font's kerning is already optimized, no intervention needed |
| **English** | All-caps headings | `0.05–0.1em` | Uppercase letter spacing needs manual compensation |
| **English** | H1–H2 mixed case | `-0.01–0em` | Large font sizes should be slightly tightened to avoid loose appearance |

---

## VIII. LLM Agent-Based Theme Color Strategy

> **Typesetting Iron Rule**: No matter how content type and style vary, **physical typesetting parameters (font size, line height, spacing, etc.) must remain absolutely stable**. The system must never change font size based on content. The only visual parameter the Agent is authorized to adaptively adjust is the **color system (background, text, border colors)**.

### 1. Agent Content Classification Strategy

Before entering the typesetting rendering engine, the LLM Agent performs rapid classification of Markdown content:

- **Input**: Full text or first 800 characters (sufficient to extract core semantic and typesetting characteristics).
- **Classification dimensions**:
  - **Vocabulary**: Contains many technical terms, code blocks, data, or English abbreviations → **Tech**
  - **Tone**: Objective, cold narration → **Tech**; long expository sentences, educational content → **Humanities**; emotional expression, first-person, many short sentences → **Emotion**
  - **Layout**: Contains dense multi-level lists or complex tables → **Tech**
- **Output constraint**: Agent must return only the JSON enum value `{"theme": "tech" | "humanities" | "emotion"}`, no other content.

### 2. Three Ready-to-Use Color Themes

After the rendering pipeline receives the enum value, the corresponding CSS Color Tokens (Design Tokens) are injected:

#### Theme A: Tech & News
- **Style**: Clean, objective, sharp — suited for high information-density reading.
- **Color values**:
  - **Background (cool white)**: `#F8F9FA`
  - **Primary text (headings/body)**: `#1A1B1E` (very dark gray — pure black is prohibited)
  - **Secondary text (metadata/quotes)**: `#5C5F66`
  - **Decorative lines (borders/dividers)**: `#E9ECEF`

#### Theme B: Humanities & Narrative
- **Style**: Classic, calm, paper-like texture of traditional publications — extremely friendly for long-form reading.
- **Color values**:
  - **Background (warm white)**: `#FAF8F5`
  - **Primary text (headings/body)**: `#2C2B29`
  - **Secondary text (metadata/quotes)**: `#73706B`
  - **Decorative lines (borders/dividers)**: `#E6E2DA`

#### Theme C: Emotion & Life
- **Style**: Relaxed, warm, with breathing room and a sense of temperature — suited for diary-style and prose.
- **Color values**:
  - **Background (cream yellow)**: `#FDF6E3`
  - **Primary text (headings/body)**: `#332F2A`
  - **Secondary text (metadata/quotes)**: `#857C70`
  - **Decorative lines (borders/dividers)**: `#EBE1C5`

> **Note**: Dark mode, due to its dependency on the user's physical reading environment preference (day/night), should not be inferred by the Agent — it should be a manual toggle on the client side. Regardless of theme, **pure white background `#FFFFFF` is strongly discouraged**: it creates harsh contrast and lacks visual boundary definition when displayed on phones.

---

## IX. Consolidated Quick-Reference Parameters

> The following are recommended defaults for Chinese content on a 1080px canvas, and can be used as the baseline configuration for a rendering engine.

```
--- Canvas ---
Canvas width:         1080px
Effective content width: 920px
Left/right margins:   80px each
Top margin:           108px
Bottom margin:        88px
Theme colors:         Injected by Agent (cool white / warm white / cream yellow)

--- Fonts ---
Font family:          Noto Sans CJK SC (Chinese)
                      Noto Sans CJK JP (Japanese)
                      Noto Sans (English)

--- Body ---
Font size:            32px
Line height:          56px (1.75×)
Letter spacing:       0.05em
Paragraph spacing:    56px

--- H5 ---
Font size:            36px
Line height:          54px (1.5×)
Letter spacing:       0.04em
Margin before:        80px
Margin after:         24px

--- H4 ---
Font size:            40px
Line height:          60px (1.5×)
Letter spacing:       0.03em
Margin before:        80px
Margin after:         24px

--- H3 ---
Font size:            48px
Line height:          67px (1.4×)
Letter spacing:       0.02em
Margin before:        88px
Margin after:         28px

--- H2 ---
Font size:            56px
Line height:          73px (1.3×)
Letter spacing:       0.02em
Margin before:        96px
Margin after:         32px

--- H1 ---
Font size:            72px
Line height:          90px (1.25×)
Letter spacing:       0.01em
Margin before:        108px
Margin after:         40px

--- Special Style Rules ---
| Blockquote (> )          | Border thickness, left decorative bar color contrasts with main text. Background overlaid with 3% gray |
| Highlight (==text==)     | Rounded gold semi-transparent background for soft highlighting, dark/light mode compatible |
| Super/Subscript (^t^, ~t~) | Text shrunk to 0.7em with precise relative vertical baseline alignment |
| Task list (- [ ])        | Cancels outer ul bullet prefix, custom elegant checkbox (checkmark with transparent anti-aliased cutout) |
| Vector diagram (Mermaid) | Generated as lossless SVG via backend compilation. Forced width: 100% centered layout; font scales proportionally with viewport due to vector nature, matching 80–100% of body font readability |
| Other special text       | Including bold, italic, etc. — strictly compatible with native typesetting visual expectations |
```

---

## X. Japanese and English Parameter Adjustments

The quick-reference table above uses Chinese as the baseline. When using Japanese or English, adjust proportionally as follows:

| Parameter | Chinese | Japanese adjustment | English adjustment |
|-----------|---------|--------------------|--------------------|
| Body font size | 32px | -2px → 30px | -4px → 28px |
| Line height ratio | 1.75× | 1.75× (unchanged) | 1.75× (unchanged) |
| Body letter spacing | 0.05em | 0.05em (unchanged) | 0 (default) |
| Heading letter spacing | 0.01–0.02em | 0–0.02em | -0.01–0em |
| All-caps heading spacing | N/A | N/A | 0.05–0.1em |

---

## XI. X/Twitter Multi-Image Slicing Strategy

### Platform Constraints

| Constraint | Limit |
|-----------|-------|
| Max images per post | **4** |
| Single image file size cap | **5MB** (PNG) |
| Canvas width baseline | **1080px** |

---

### Single Image Height Limit (H_max)

| Content Type | Recommended H_max | Notes |
|-------------|-------------------|-------|
| Text-only / text-dominant | **10000px** | 1080×10000 PNG ≈ 1–2MB, text compresses well |
| Mixed graphic (contains embedded images) | **8000px** | Image pixels are incompressible; safety margin preserved |
| **Conservative default (recommended)** | **8000px** | Use uniformly — no need to differentiate by content type |

**Total capacity limit = H_max × 4 = 32000px**

---

### Tile Count Formula

With actual rendered height `H_total` as input:

```
N = ceil(H_total / H_max)

N = 1  →  Single image, no slicing needed     (H_total ≤  8000px)
N = 2  →  Slice into 2 images                 (H_total ≤ 16000px)
N = 3  →  Slice into 3 images                 (H_total ≤ 24000px)
N = 4  →  Slice into 4 images                 (H_total ≤ 32000px)
N > 4  →  ERROR: Content exceeds capacity limit, rendering refused
```

---

### Cut-Point Selection Algorithm

**Ideal target cut point** (theoretical even split):

```
target_y[i] = H_total × i / N    (i = 1 … N-1)
```

**Actual cut point**: Search near the target for the closest **semantic boundary**, priority from high to low:

| Priority | Semantic Boundary Type | Notes |
|----------|----------------------|-------|
| 1 (best) | **Top edge** of H1 / H2 heading | Most complete semantics, natural chapter break |
| 2 | Top edge of H3 / H4 heading | Sub-section boundary |
| 3 | **Gap midpoint** between paragraphs | Regular paragraph boundary |
| 4 | **Bottom edge** of embedded image | Do not cut inside an image |
| 5 (fallback) | Gap between lines | Last resort — ensures no hard cut through text |

**Search window rules**:
- Initial search window: target cut point ±15% × (H_total / N)
- If no semantic boundary found: expand to ±25%
- If still no boundary (very rare, e.g., an extremely long single paragraph): fall back to line gaps

**Cutting prohibition rules** (iron rules):
- Prohibited: cutting **inside a paragraph** (cannot cut within the same `<p>` tag)
- Prohibited: cutting **inside an embedded image**
- Prohibited: cutting **inside a table** (tables must belong entirely to one image)
- Prohibited: cutting **inside a code block**

**Oversized Element Deadlock Resolution (Oversized Fallback)**:
If a massive image (or very long code block) fills or exceeds the ±25% search window such that no semantic boundary exists within the window (e.g., a single 5000px image straddles the 8000px cut point), the following fallback strategy must be activated:
1. **Upward retreat (preferred)**: Ignore the original cut point, expand search upward until reaching the **top edge** of the massive image. This may result in a shorter current tile (e.g., cutting at 5000px instead of 8000px), but preserves 100% image integrity.
2. **Downward extension tolerance**: If upward retreat would create a too-short previous tile (e.g., only 2000px — visually poor), search for the image's **bottom edge** downward. The condition is that the resulting tile height must not exceed the 10000px absolute limit.
3. **Forced hard cut (last resort)**: If a single image's height itself exceeds the platform's absolute limit (i.e., `H > 10000px` — extreme long-scroll comic-style), the iron rule against cutting inside images must be overridden. The system cuts at 8000px regardless of element structure to prevent publication failure.

---

### Two-Stage Capacity Pre-Check Mechanism

To avoid discovering over-limit content only after full rendering (wasting render resources), a two-stage detection is implemented:

#### Stage 1: Estimation Check (Pre-render, millisecond-level)

Rapid statistical estimation based on the Markdown source file:

| Element Type | Estimated Height |
|-------------|-----------------|
| Each line of body text (920px width / 32px size, ~28 chars/line) | 56px (including line height) |
| Each paragraph spacing | 56px |
| Each H1 heading (including before/after spacing) | 90 + 108 + 40 = 238px |
| Each H2 heading (including before/after spacing) | 73 + 96 + 32 = 201px |
| Remote `http` network images | **Immediately intercepted with error** (current version does not support network image stability prediction) |
| Local relative path images | Per "**scale by width, never enlarge**" rule: if original width > 920px, calculate as `actual_height × (920 / actual_width)`; if original width ≤ 920px, use the actual physical height without any scaling. Millisecond-level header reading — accurate and precise. |
| Top + bottom margins | 108 + 88 = 196px |

**Estimation formula**:

```
H_estimated = 196 (fixed margins)
            + Σ body line heights
            + Σ paragraph spacings
            + Σ heading heights
            + Σ estimated image heights
```

**Pre-check threshold**: Trigger warning when `H_estimated > 32000 × 0.75` (i.e., 24000px); error when `> 32000px`, skip rendering.

> The 0.75 coefficient reflects the conservative nature of estimation, leaving margin for actual rendering. If estimation exceeds 24000px, actual height after rendering remains the final arbiter.

#### Stage 2: Precise Check (Post-render)

- After Playwright completes the screenshot, read actual page height `page.height`
- If `page.height > 32000px` → error and clean up all temporary files
- Error message should include: actual height, excess amount, estimated word count to reduce

---

### Error Message Specification

When content exceeds capacity, the system should output a structured error:

```
ERROR [CAPACITY_EXCEEDED]
  Actual rendered height:  36480px
  Capacity limit:          32000px (4 × 8000px)
  Excess:                  4480px (~14%)
  Suggested reduction:     ~800–1000 Chinese characters (body text estimate)
  Current version:         Does not support auto-truncation — please manually trim the source Markdown and retry
  Future capability:       Future versions may integrate Agent-driven text compression to fit capacity constraints
```

---

### Output Naming Convention for Sliced Images

```
{filename}_1of{N}.png
{filename}_2of{N}.png
...
{filename}_Nof{N}.png
```

Example: Input file `article.md`, sliced into 3 images → `article_1of3.png`, `article_2of3.png`, `article_3of3.png`

---

### Visual Continuity Handling

| Element | Handling |
|---------|---------|
| Bottom margin at cut point | Preserve normal bottom margin (88px), do not add extra indicator text |
| Top margin at cut point | Preserve normal top margin (108px), do not add extra indicator text |
| Page numbering | Optional: add small "1/3", "2/3" labels in the bottom-right corner of each image (24px, 40% opacity) |
| Branding | If needed, place on the first image only — do not repeat on subsequent images |

> The current version does not mandate page numbering — left to the implementer's discretion.

---

*This document was generated through dialogue and discussion. Parameters are based on typesetting best practices and social media platform testing experience. To implement in a specific rendering engine, the quick-reference table can be directly mapped to CSS variables or JSON configuration items.*
