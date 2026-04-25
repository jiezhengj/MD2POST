> Language / 言語: [English](./SKILL.en.md) | **中文** | [日本語](./SKILL.ja.md)

---
name: md2post
description: 轻量级 Markdown 转长图渲染引擎。给定一份 Markdown 文件，自动完成"语义切分 → 无头浏览器精确光栅化 → 分片 PNG 导出"全流程，输出符合 X/Twitter、微博等平台尺寸约束的高清长图。
---

# MD2POST — Skill 使用说明（Agent 专用）

> 本文档专为 AI Agent 阅读而设计。目标是让任何主流模型框架（包括 Codex、Claude Code、Open Code、Gemini CLI、Antigravity、Trae 等）都能自主完成环境准备、运行与集成。

---

## 一、技能定位

MD2POST 是一个**"肌肉型"确定性执行工具**，职责范围极其清晰：

- **输入**：一份本地 `.md` 文件路径 + 可选主题与语言参数
- **输出**：若干张高清 PNG 长图，落地于指定的输出目录

Agent 的职责是准备好输入文件并调用该工具；MD2POST 的职责是以确定性方式完成从文本到图片的全程转换，不依赖任何外部 API，不需要网络权限。

---

## 二、系统前置要求

在调用本技能前，请确保宿主机已满足以下条件：

| 依赖项 | 版本要求 | 说明 |
|--------|----------|------|
| **Node.js** | ≥ 18 LTS | 需支持 ESM (`"type": "module"`) |
| **npm** | ≥ 9 | 用于安装依赖 |
| **Chromium 或 Chrome** | 由 Playwright 自动管理 | 用于无头浏览器截图 |

---

## 三、环境安装步骤（首次使用）

请按顺序执行以下命令。每条命令执行完毕后等待其成功输出，再执行下一条。

### 步骤 1：安装 Node 依赖

```bash
npm install
```

### 步骤 2：安装 Playwright 的无头浏览器内核

这一步会下载 Chromium，需要约 200MB 磁盘空间与网络连接。

```bash
npx playwright install chromium
```

### 步骤 3：验证安装

```bash
npx tsx src/index.ts --help
```

如果输出了参数说明，说明环境就绪。

### 步骤 4：构建 Vendor 模块 (beautiful-mermaid fork)

本项目包含一个带 Issue #83 修复 (TD/TB 布局翻转 bug) 的 `beautiful-mermaid` 本地 fork，需要构建：

```bash
cd vendor/beautiful-mermaid
npm install
npm run build
cd ../..
```

---

## 四、CLI 调用接口

### 基本格式

```bash
npx tsx src/index.ts -i <输入文件> [选项]
```

### 完整参数表

| 参数 | 短名 | 必填 | 默认值 | 可选值 | 说明 |
|------|------|------|--------|--------|------|
| `--input` | `-i` | 是 | — | 任意 `.md` 文件路径 | 输入的 Markdown 文件（相对或绝对路径） |
| `--output` | `-o` | 否 | `./out` | 任意目录路径 | 输出目录（自动创建） |
| `--theme` | `-t` | 否 | `humanities` | `tech` / `humanities` / `emotion` | 视觉风格主题 |
| `--lang` | `-l` | 否 | `zh` | `zh` / `ja` / `en` | 正文语言种类（影响字号与排版密度） |

### 调用示例

```bash
# 最简调用（使用默认主题和语言）
npx tsx src/index.ts -i ./my_article.md

# 指定蓝色科技主题 + 英文
npx tsx src/index.ts -i ./report.md -t tech -l en -o ./output

# 指定情感主题 + 日文
npx tsx src/index.ts -i ./post.md -t emotion -l ja
```

---

## 五、三种主题说明

| 主题标识 | 名称 | 风格描述 | 适用场景 |
|----------|------|----------|----------|
| `tech` | 科技风 | 冷白底色 + 蓝紫系高亮 | 技术分享、产品分析 |
| `humanities` | 人文风 | 奶油暖白 + 赭红系点缀 | 书评、随笔、人文内容 |
| `emotion` | 情感风 | 深色底色 + 金色高亮 | 感悟、诗歌、情绪化内容 |

---

## 六、支持的 Markdown 语法

以下语法在本引擎中均已完整支持并进行了视觉精调：

**标准语法**
- 有序 / 无序列表、嵌套缩进
- 加粗、斜体、删除线
- 行内代码、代码块（带语法高亮容器）
- 引用块（Blockquote）
- 表格
- 图片（**仅支持本地相对路径**，禁止 HTTP 远程图片）
- 分割线 `---`

**扩展语法**（通过官方插件支持）
- `==高亮文字==` — 金黄色圆角高亮标记
- `^上标^` / `~下标~` — 精准基线对齐的上下标
- `- [ ] 未完成` / `- [x] 已完成` — 精美圆角 Checkbox 任务列表

**Mermaid 图表**
- 在代码块中使用 `` ```mermaid `` 即可。
- 引擎将在 AST 阶段同步调用 `beautiful-mermaid` 编译为高保真 SVG 矢量图，无渲染延迟、无失真放大。
- 支持：`graph TD/LR`、`flowchart`、`stateDiagram-v2`、`sequenceDiagram`、`classDiagram`、`erDiagram` 等主流类型。
- **注意**：Mermaid 语法头部不可添加分号（例：`graph TD;` 是无效的，请使用 `graph TD`）。

---

## 七、输出物说明

成功执行后，输出目录会包含以下文件：

| 文件名 | 说明 |
|--------|------|
| `debug_phase1.html` | 预览用 HTML 文件（可在浏览器中打开验证排版） |
| `post.png` | 内容高度不超过 8000px 时的单张输出图 |
| `post_1of3.png` 等 | 内容超过 8000px 时，按语义安全切分后的分片图 |

---

## 八、容量限制与错误处理

| 情况 | 触发条件 | 引擎行为 |
|------|----------|----------|
| 正常 | 估算高度 < 24000px | 正常渲染 |
| 警告 | 估算高度 24000～32000px | 打印 `[WARNING]`，激活多图切分模式，继续执行 |
| 致命错误 | 估算高度 > 32000px | 打印 `[CAPACITY_EXCEEDED]` 并终止，提示削减字符数量 |
| 远程图片 | Markdown 中含 `http://` 或 `https://` 的图片 | 立即报错并终止，禁止网络请求 |

---

## 九、Agent 集成建议

1. **前置生成内容**：Agent 可先将用户内容整理为标准 Markdown，然后将其写入临时文件，再调用本工具。
2. **参数决策**：主题（`--theme`）和语言（`--lang`）是唯一允许 Agent 动态传入的参数。所有排版铁律（字号、行距、间距）固化在引擎内部，Agent 不可覆写。
3. **图片引用**：如内容含有插图，须确保图片文件已以相对路径写入本地，并在 Markdown 中正确引用（例：`![图片描述](./images/chart.png)`）。
4. **错误自愈**：若遇到 `[CAPACITY_EXCEEDED]`，Agent 应自动将原文分段，分多次调用本工具生成多组图片。

---

## 十、参考资料（知识库）

以下两份文档是本技能的底层设计依据，建议在遇到疑问时优先查阅：

- **[长图排版最佳实践](./docs/best-practices.zh.md)**：定义了字号体系、颜色主题、越界降级策略等排版铁律，是引擎行为的视觉规约。
- **[技术架构方案](./docs/architecture.zh.md)**：定义了双阶段容量熔断机制、语义切分算法原理、Mermaid 拦截链路等核心技术决策。
