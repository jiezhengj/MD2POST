import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TypographyConfig, THEME_TOKENS, LANG_BASELINE } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 将解析出的 HTML Body 与预设配置注入到 HTML 原型母版中
 * @param parsedBody 由 markdown-it 解析得到的 HTML 实体片段
 * @param config Agent 决策或命令行传入的排版参数结构体
 * @returns 完整的 <html> 文档字符串
 */
export function buildHTMLFromTemplate(parsedBody: string, config: TypographyConfig): string {
  // 1. 获取母板路径并读取（assets/template.html）
  const templatePath = resolve(__dirname, '../assets/template.html');
  let template = readFileSync(templatePath, 'utf8');

  // 2. 解析色彩和字号的宏观常数
  const palette = THEME_TOKENS[config.theme];
  const baselineFontSize = LANG_BASELINE[config.language];

  // 计算语言关联字间距等参数
  const isEn = config.language === 'en';
  const letterSpacing = isEn ? '0' : '0.05em';

  // 3. 词法级别替换（注：使用 split+join 提升了少量性能并规避正则替换 $ 符号转义问题）
  template = template.split('{{LANG}}').join(config.language);
  template = template.split('{{BG_COLOR}}').join(palette.bg);
  template = template.split('{{TEXT_MAIN}}').join(palette.textMain);
  template = template.split('{{TEXT_SUB}}').join(palette.textSub);
  template = template.split('{{BORDER_COLOR}}').join(palette.border);
  template = template.split('{{BASE_FONT_SIZE}}').join(baselineFontSize.toString());
  template = template.split('{{LETTER_SPACING}}').join(letterSpacing);
  
  // 注入核心内容
  template = template.split('{{CONTENT}}').join(parsedBody);

  return template;
}
