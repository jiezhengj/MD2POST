import { Page } from 'playwright';

export interface SemanticBoundary {
  type: string;
  top: number;
  bottom: number;
}

/**
 * 注入页面，获取所有关键元素的绝对 Y 轴坐标（基于文档级，非视口级）
 * 以此构建一片“无雷区”的切割缝隙数组
 */
export async function probeBoundaries(page: Page): Promise<SemanticBoundary[]> {
  return await page.evaluate(() => {
    // 圈定可能产生排版断层的核心节点，必须只取最顶层的 Flow 块（规避切割列表或引言内部）
    const elements = document.querySelectorAll('.container > *');
    const boundaries: SemanticBoundary[] = [];
    
    // 获取当前滚动偏移值（虽然无头通常为 0，起一个定海神针作用）
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      boundaries.push({
        type: el.tagName.toLowerCase(),
        // 对坐标全部平移映射到绝对 DOM 文档高度上
        top: Math.floor(rect.top + scrollTop),
        bottom: Math.ceil(rect.bottom + scrollTop)
      });
    });
    
    // 按照从上到下的渲染纵深进行严格排序
    return boundaries.sort((a, b) => a.top - b.top);
  });
}
