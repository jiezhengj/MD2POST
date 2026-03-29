import MarkdownIt from 'markdown-it';
import { resolve, dirname } from 'path';

// 初始化 MarkdownIt 实例
const md = new MarkdownIt({
  html: true,       // 允许 HTML 标签
  breaks: false,    // 禁用回车即换行（保持原生 Mrakdown 段落逻辑）
  linkify: true,    // 自动将 URL 转为链接
  typographer: true // 启用排版替补（直引号变弯引号等）
});

/**
 * 将 Markdown 文本安全转换为 HTML 字符串，并把图片改写为本地物理绝对路径以供 Chromium 渲染
 * @param content 原始 Markdown 文本
 * @param mdFilePath 原始 Markdown 绝对路径，用于计算图片的相对位置基准
 * @returns 渲染好的 HTML 字符串
 */
export function parseMarkdown(content: string, mdFilePath: string): string {
  if (!content) return '';
  
  const baseDir = dirname(mdFilePath);

  // Hook 拦截原生的图片渲染逻辑，改写 src
  const defaultImageRenderer = md.renderer.rules.image || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    if (srcIndex >= 0 && token.attrs) {
      const src = token.attrs[srcIndex][1];
      if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
        // 转换为绝对路径 file:// 以备 Playwright 无头载入时正确挂载本地资源
        token.attrs[srcIndex][1] = 'file://' + resolve(baseDir, src);
      }
    }
    return defaultImageRenderer(tokens, idx, options, env, self);
  };
  
  const rawHtml = md.render(content);
  return rawHtml;
}
