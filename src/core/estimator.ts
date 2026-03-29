import MarkdownIt from 'markdown-it';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { TypographyConfig } from '../types.js';

const require = createRequire(import.meta.url);
const sizeOf = require('image-size');

// 初始化独立的 md 实例用于探针解析 (无渲染开销)
const md = new MarkdownIt();

export interface EstimationResult {
  estimatedHeight: number;
  wordCount: number;
  imageCount: number;
  isOverCapacity: boolean;
  isWarning: boolean;
}

/**
 * 核心查算常数对齐表 (来自最佳实践，默认以中文为基准)
 * 考虑到该拦截器的主要目标是挡住「恶意/意外的长请求」，所以我们采用保守的高估算模型
 */
const EST_CONSTANTS = {
  CANVAS_PADDING: 196, // 头端与尾端白边总和
  LINE_HEIGHT: 56,     // 正文基础行高
  CHARS_PER_LINE: 28,  // 920px 有效宽度下约排布数目 (中文字相对较大)
  P_MARGIN: 56,        // 段落间距
  IMG_HEIGHT: 600,     // 单张图片估算高度 (含边距)
  
  // 标题总占用高度 (自身行高 + 上浮边距 + 下浮边距)
  H1: 238, // 90 + 108 + 40
  H2: 201, // 73 + 96 + 32
  H3: 183, // 67 + 88 + 28
  H4: 164, // 60 + 80 + 24
  H5: 158, // 54 + 80 + 24
};

const MAX_CAPACITY = 32000;
const WARN_CAPACITY = 24000;

/**
 * 执行高度粗估查算（毫秒级第一阶段防御）
 * @param content 源 Markdown 内容
 * @param config 预设参数（为英文或日文调整每行字数容量）
 * @param mdFilePath 原始 Markdown 文件的绝对路径（用于解析相对图片路径）
 * @returns 预估计算结果 
 */
export function estimateHeight(content: string, config: TypographyConfig, mdFilePath: string): EstimationResult {
  const tokens = md.parse(content, {});
  const baseDir = dirname(mdFilePath);
  
  let totalHeight = EST_CONSTANTS.CANVAS_PADDING;
  let wordCount = 0;
  let imageCount = 0;
  
  // 按照语言调整单位字的容载量
  let charsPerLine = EST_CONSTANTS.CHARS_PER_LINE;
  if (config.language === 'en') charsPerLine = 48; // 英文单词字母较窄
  if (config.language === 'ja') charsPerLine = 30; // 日文由于假名的存在可能稍稍多一点点

  for (const token of tokens) {
    // 标题区块
    if (token.type === 'heading_open') {
      switch (token.tag) {
        case 'h1': totalHeight += EST_CONSTANTS.H1; break;
        case 'h2': totalHeight += EST_CONSTANTS.H2; break;
        case 'h3': totalHeight += EST_CONSTANTS.H3; break;
        case 'h4': totalHeight += EST_CONSTANTS.H4; break;
        case 'h5': 
        case 'h6': totalHeight += EST_CONSTANTS.H5; break;
      }
    }
    
    // 段落区块
    if (token.type === 'paragraph_open') {
      totalHeight += EST_CONSTANTS.P_MARGIN;
    }
    
    // 行间距区块、引用块
    if (token.type === 'blockquote_open') {
      totalHeight += EST_CONSTANTS.P_MARGIN;
    }
    if (token.type === 'hr') {
      totalHeight += 120; // 粗估上下 margin
    }

    // 文本内容遍历与行数推演
    if (token.type === 'inline' && token.children) {
      for (const child of token.children) {
        if (child.type === 'text' || child.type === 'code_inline') {
          const textLength = child.content.length;
          wordCount += textLength;
          // 按每行额定字数换算为行数，并叠加基础行高
          const lines = Math.ceil(textLength / charsPerLine);
          totalHeight += lines * EST_CONSTANTS.LINE_HEIGHT;
        }
        
        if (child.type === 'image') {
          imageCount++;
          let addedHeight = EST_CONSTANTS.IMG_HEIGHT; // 默认回退值

          const srcVal = child.attrGet('src');
          if (srcVal) {
            if (srcVal.startsWith('http://') || srcVal.startsWith('https://')) {
              throw new Error(`[UNSUPPORTED_FEATURE] Remote HTTP images are currently unsupported for predictability and stability. Please use local paths (e.g., ./image.png). Image found: ${srcVal}`);
            }

            // 本地路径，利用 image-size 精确读取文件 Header
            try {
              const absPath = resolve(baseDir, srcVal);
              if (existsSync(absPath)) {
                const dimensions = sizeOf(absPath);
                if (dimensions.width && dimensions.height) {
                  // 插图理论：只有缩小、没有放大。若实际宽度超标则等比压缩高度
                  if (dimensions.width > 920) {
                    addedHeight = (920 / dimensions.width) * dimensions.height;
                  } else {
                    // 若图小（宽度 <= 920px），按原物理尺寸原样排布，绝不放大
                    addedHeight = dimensions.height;
                  }
                  // 计入图片边缘 margin
                  addedHeight += EST_CONSTANTS.P_MARGIN * 1.5 * 2; 
                }
              }
            } catch (err) {
              // 找不到文件或解析失败，降级回预估值
            }
          }
          totalHeight += addedHeight;
        }
      }
    }
  }

  return {
    estimatedHeight: totalHeight,
    wordCount,
    imageCount,
    isOverCapacity: totalHeight > MAX_CAPACITY,
    isWarning: totalHeight > WARN_CAPACITY
  };
}
