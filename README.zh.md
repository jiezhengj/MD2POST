> Language / 语言: [English](./README.en.md) | **中文** | [日本語](./README.ja.md)

# MD2POST

**个人级 Markdown 转长图渲染引擎 · Agent Skill**

> 本项目处于早期验证阶段，尚未经过充分测试。欢迎社区继续测试、改进，并按自己的需求修改使用。

---

## 项目背景

在 AI 辅助创作日益普及的今天，大模型可以帮助我们生成高质量的内容，但从"一段文字"到"一张适合社交媒体传播的高清长图"，中间存在一个复杂的排版和格式化工程问题。

MD2POST 诞生于这样的背景：我们希望构建一个**确定性、高精度、无需人工干预**的渲染引擎，让 AI Agent 能够直接调用它，将整理好的 Markdown 内容自动转化为符合 X/Twitter、微博等平台分发标准的长图。

这是一个"大脑-肌肉分工"的设计理念：大模型负责内容决策，MD2POST 负责确定性的物理排版执行。

---

## 项目特色

### 双阶段容量熔断机制
引擎内置了两道独立的防御栏：
- **Phase 1（毫秒级预估）**：在 AST 解析阶段，通过保守的高度估算算法快速扫描全文，若预判超过平台像素上限则立即拒载，阻止昂贵的浏览器启动。
- **Phase 2（精确熔断）**：在 Chromium 真实渲染后，读取实际的 DOM 物理高度进行二次确认。

### 语义感知的智能切分算法
当内容过长需要切分为多张图片时，引擎不会简单地按像素高度"腰斩"内容。它会通过向无头浏览器注入 JS 探针，获取所有 DOM 元素的精确坐标，并在标题前、段落间隙等"安全缝隙"处下刀，确保文字永远不会被拦腰截断。

### 越界死锁解除策略
针对超大元素（如巨幅插图、大型表格）导致无法在预定空间内切分的极端情况，引擎实施了三级降级策略：向上退避 → 向下延展 → 暴力硬截，确保流程永不死锁。

### 后端同步 Mermaid 渲染
对于 Mermaid 流程图，引擎采用 `beautiful-mermaid` 在 AST 解析阶段同步生成高保真 SVG 矢量图，避免了前端异步渲染引发的时序竞争问题，并天然继承长图的主题配色体系。

### 三套精调视觉主题
引擎内置了三套完整的视觉主题（科技风、人文风、情感风），通过 CSS Design Token 体系实现，Agent 调用时只需传入一个参数即可切换全套配色。

### 严格的插图安全策略
- 禁止 HTTP 远程图片（防止网络 I/O 拖慢或卡死流水线）
- 插图遵循"只缩不放"原则（宽度超出时等比缩小，不足时按原尺寸排布）
- 使用 `image-size` 毫秒级读取本地图片 Header，实现像素级高度预估

---

## 支持的 Markdown 语法

| 类别 | 支持情况 |
|------|---------|
| 标题 H1-H6 | 完整支持，含精调字号与间距 |
| 有序 / 无序列表、缩进 | 完整支持 |
| 加粗、斜体、删除线 | 完整支持 |
| 行内代码、代码块 | 完整支持，等宽字体 + 深色背景 |
| 表格 | 完整支持，含表头底色 |
| 引用块 | 完整支持，含左侧装饰条 |
| 本地图片（相对路径） | 完整支持 |
| `==高亮==` | 支持（`markdown-it-mark`） |
| `^上标^` / `~下标~` | 支持（`markdown-it-sup` / `markdown-it-sub`） |
| `- [ ] 任务列表` | 支持（`markdown-it-task-lists`），精美圆角复选框 |
| Mermaid 流程图 | 支持（`beautiful-mermaid`），后端同步 SVG |

---

## 快速开始

### 1. 安装依赖

```bash
cd MD2POST
npm install
npx playwright install chromium
```

### 1.1 Vendor 构建 (beautiful-mermaid fork)

本项目包含一个带 Issue #83 修复 (TD/TB 布局翻转 bug) 的 `beautiful-mermaid` 本地 fork。克隆后需要额外构建：

```bash
cd vendor/beautiful-mermaid
npm install
npm run build
cd ../..
```

### 2. 运行

```bash
npx tsx src/index.ts -i ./example.md -t tech -l zh
```

项目中包含一份 [示例文件](./example.md)，涵盖了 Mermaid 流程图、任务列表、高亮、表格等全部高级语法，可用于直接验证引擎效果。

完整参数说明请参阅 **[SKILL.zh.md](./SKILL.zh.md)**（Agent 专用接口文档）。

### 3. 查看输出

生成的图片将出现在 `./out/` 目录中。`debug_phase1.html` 可在浏览器中打开预览排版效果。

---

## 文档索引

| 文档 | 目标读者 | 说明 |
|------|---------|------|
| **[SKILL.zh.md](./SKILL.zh.md)** | AI Agent | 完整调用接口说明、参数表、错误处理、集成建议 |
| **[长图排版最佳实践](./docs/best-practices.zh.md)** | 开发者 / Agent | 定义字号、配色、切分策略等排版铁律 |
| **[技术架构方案](./docs/architecture.zh.md)** | 开发者 | 渲染流水线、熔断机制、语义切分算法的技术说明 |

---

## 关于测试状态

本项目目前处于**原型验证阶段**，已完成核心渲染流水线的端到端调试，但尚未经过以下方面的充分测试：

- 大量真实内容的边缘案例覆盖
- 跨操作系统（Linux / Windows）的兼容性验证
- 中英日以外的语言排版表现
- 更多 Mermaid 图表类型的渲染质量
- 极端情况下的性能表现（如 64MB+ 的 PNG 输出）

**欢迎任何人在此基础上继续测试、提交 Issue 或修改适配自己的使用需求。** 这个引擎的设计思路是完全开放的，所有核心算法均有详细注释。

---

## 致谢

本项目的实现依赖了以下优秀的开源项目，没有它们，这个引擎不可能存在：

| 库 | 用途 | 链接 |
|----|------|------|
| **Playwright** | 无头 Chromium 浏览器自动化，驱动高精度截图 | [microsoft/playwright](https://github.com/microsoft/playwright) |
| **Sharp** | 高性能 Node.js 图像处理，负责 PNG 切片导出 | [lovell/sharp](https://github.com/lovell/sharp) |
| **markdown-it** | 高质量 Markdown 解析器，项目的 AST 基石 | [markdown-it/markdown-it](https://github.com/markdown-it/markdown-it) |
| **beautiful-mermaid** | 零依赖、同步、可高度美化的 Mermaid SVG 渲染器 | [lukilabs/beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) |
| **markdown-it-mark** | `==高亮==` 语法扩展 | [markdown-it/markdown-it-mark](https://github.com/markdown-it/markdown-it-mark) |
| **markdown-it-sup** | `^上标^` 语法扩展 | [markdown-it/markdown-it-sup](https://github.com/markdown-it/markdown-it-sup) |
| **markdown-it-sub** | `~下标~` 语法扩展 | [markdown-it/markdown-it-sub](https://github.com/markdown-it/markdown-it-sub) |
| **markdown-it-task-lists** | `- [ ]` 任务列表语法扩展 | [revin/markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists) |
| **image-size** | 毫秒级读取图片 Header 获取尺寸，无需全量解码 | [image-size/image-size](https://github.com/image-size/image-size) |
| **Commander.js** | CLI 参数解析 | [tj/commander.js](https://github.com/tj/commander.js) |
| **Zod** | TypeScript 优先的运行时参数校验 | [colinhacks/zod](https://github.com/colinhacks/zod) |

---

## License

MIT
