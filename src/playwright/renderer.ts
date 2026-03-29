import { chromium, Browser, Page } from 'playwright';

export interface RenderContext {
  browser: Browser;
  page: Page;
  actualHeight: number;
}

/**
 * 启动无头浏览器并装载渲染好的 HTML，执行真实物理版面的容量压测
 */
export async function setupRenderer(htmlContent: string): Promise<RenderContext> {
  // 启动 Chromium 无头模式
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 }, // 初始给一个常规视口长度，不影响全宽截图
    deviceScaleFactor: 2, // 使用 Retina @2x 倍率，极大提升文字截图的锐利度
  });

  // 注入 HTML 内容（此时所有本地路径已被 AST 转换为 file:// 绝对路径）
  // waitUntil: 'networkidle' 确保全部本地或外部图片、CSS加载完成
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  // 主动等待可能存在的前端网络字体渲染动作
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  
  // 测量浏览器排版引擎生成的真实页面高度
  const actualHeight = await page.evaluate(() => {
    return Math.ceil(document.body.getBoundingClientRect().height);
  });

  // 第二级精细熔断：硬件高度死线
  if (actualHeight > 32000) {
    await browser.close();
    throw new Error(`[RENDER_REJECTED] Actual rendered height (${actualHeight}px) exceeds the hard physical limit of 32000px.`);
  }

  return { browser, page, actualHeight };
}
