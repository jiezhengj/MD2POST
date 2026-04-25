import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { TypographyConfigSchema } from './types.js';
import { parseMarkdown } from './render/markdown.js';
import { buildHTMLFromTemplate } from './render/htmlBuilder.js';
import { estimateHeight } from './core/estimator.js';
import { setupRenderer } from './playwright/renderer.js';
import { probeBoundaries } from './playwright/probe.js';
import { calculateSlicePoints } from './core/slicer.js';
import { sliceAndExport } from './postprocess/imageExport.js';

const program = new Command();

program
  .name('md2post')
  .description('Lightweight Markdown to Long Image Renderer (Agent Skill / CLI)')
  .requiredOption('-i, --input <file>', 'Input Markdown file path')
  .option('-o, --output <dir>', 'Output directory', './out')
  .option('-t, --theme <theme>', 'Visual theme (tech | humanities | emotion)', 'humanities')
  .option('-l, --lang <lang>', 'Base language (zh | ja | en)', 'zh');

program.parse(process.argv);
const options = program.opts();

async function main() {
  const inputPath = resolve(process.cwd(), options.input);
  if (!existsSync(inputPath)) {
    console.error(`Error: File not found at ${inputPath}`);
    process.exit(1);
  }

  // 参数强校验
  const configParseResult = TypographyConfigSchema.safeParse({ theme: options.theme, language: options.lang });
  if (!configParseResult.success) {
    console.error('Error: Invalid Typography config', configParseResult.error.issues);
    process.exit(1);
  }
  const config = configParseResult.data;

  const markdownContent = readFileSync(inputPath, 'utf8');
  console.log(`[MD2POST] Starting render pipeline...`);
  console.log(`- Input: ${inputPath}`);
  console.log(`- Theme: ${config.theme}`);
  console.log(`- Base Language: ${config.language}`);
  console.log(`- Content Length: ${markdownContent.length} chars`);

  // 创建输出目录
  const outDir = resolve(process.cwd(), options.output);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // Phase 2: 内容预压测与容量告警
  const estimation = estimateHeight(markdownContent, config, inputPath);
  console.log(`[MD2POST] Capacity Estimate: ~${estimation.estimatedHeight}px`);
  console.log(`[MD2POST] Content Scan: ${estimation.wordCount} words, ${estimation.imageCount} images`);
  
  if (estimation.isOverCapacity) {
    console.error(`\n[CAPACITY_EXCEEDED] Fatal Error: Estimated height (${estimation.estimatedHeight}px) exceeds absolute limit 32000px!`);
    console.error(`Please truncate current article by approx ${(estimation.estimatedHeight - 32000)/56 * 28} characters.\n`);
    process.exit(1);
  } else if (estimation.isWarning) {
    console.warn(`[WARNING] Estimated height (${estimation.estimatedHeight}px) is approaching upper safety limit of 32000px! Slicing mode activated.`);
  }

  // Phase 1 测试接入
  const astHtml = parseMarkdown(markdownContent, inputPath);
  const finalHtml = buildHTMLFromTemplate(astHtml, config);
  
  const testHtmlPath = resolve(outDir, 'debug_phase1.html');
  writeFileSync(testHtmlPath, finalHtml, 'utf8');
  console.log(`[MD2POST] Phase 1 & 2 Success: Safe stream passed onto HTML core at ${testHtmlPath}`);

  // Phase 3: Playwright 真实物理高度重测与拦截兜底
  console.log(`[MD2POST] Phase 3: Launching Headless Chromium to calculate accurate pixel metrics...`);
  const { browser, page, actualHeight } = await setupRenderer(finalHtml);
  
  console.log(`[MD2POST] Phase 3 Success! Accurate rendered physical height: ${actualHeight}px (Estimated was ${estimation.estimatedHeight}px)`);

  // Phase 4: 语义探针算法与多图裁切计算
  console.log(`[MD2POST] Phase 4: Probing explicit semantic boundaries for visual integrity...`);
  const boundaries = await probeBoundaries(page);
  const sliceResult = calculateSlicePoints(actualHeight, boundaries);
  console.log(`[MD2POST] Slice Strategy Decided: ${sliceResult.totalSlices} tiles. Breakdown point(s) at Y-cords: [${sliceResult.slicePoints.join(', ')}]`);

  // Phase 5: 截屏提取与 Sharp 后处理落地
  console.log(`[MD2POST] Phase 5: Capturing 2x Retina Full Page screenshot and invoking Sharp slicer...`);
  const fullPageBuffer = await page.screenshot({ fullPage: true });
  
  await browser.close();

  const exportedPath = resolve(outDir, 'post'); // 统一导出的基础名词
  const exportedFiles = await sliceAndExport(fullPageBuffer, sliceResult.slicePoints, exportedPath, 2);

  console.log(`\n[SUCCESS] MD2POST Compilation Complete! The following chunks were correctly exported:`);
  exportedFiles.forEach(f => console.log(` => ${f}`));
}

main().catch((err) => {
  console.error("Critical Failure:", err);
  process.exit(1);
});
