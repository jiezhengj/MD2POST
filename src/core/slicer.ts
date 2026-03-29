import { SemanticBoundary } from '../playwright/probe.js';

export interface SliceResult {
  slicePoints: number[]; // 那些代表图片底部的 Y 坐标切点
  totalSlices: number;
}

const H_MAX = 8000;
const ABS_MAX = 10000;

export function calculateSlicePoints(totalHeight: number, boundaries: SemanticBoundary[]): SliceResult {
  const N = Math.ceil(totalHeight / H_MAX);
  if (N <= 1) return { slicePoints: [totalHeight], totalSlices: 1 };
  if (N > 4) throw new Error('[CAPACITY_EXCEEDED] Final rendered height exceeds allowed maximum limit of 32000px.');

  const slicePoints: number[] = [];
  let prevY = 0;

  for (let i = 1; i < N; i++) {
    // 理想切点
    const idealY = Math.floor((totalHeight / N) * i);
    
    // First Pass: 扩撒 ±15% 寻找缝隙
    let searchRange = 0.15 * (totalHeight / N);
    let bestGapY = findBestGap(boundaries, idealY, searchRange, prevY);
    
    // Second Pass: 扩撒至 ±25% 寻找缝隙
    if (bestGapY === -1) {
      searchRange = 0.25 * (totalHeight / N);
      bestGapY = findBestGap(boundaries, idealY, searchRange, prevY);
    }

    if (bestGapY !== -1) {
      slicePoints.push(bestGapY);
      prevY = bestGapY;
    } else {
      // Third Pass: 极限降级处理（Oversized Fallback)
      // 这说明有一个巨长无比的单一元素跨越了我们长达 ±25% 的整个搜索雷达！
      const spanningBoundary = boundaries.find(b => b.top <= idealY - searchRange && b.bottom >= idealY + searchRange);
      
      if (spanningBoundary) {
        // Fallback 1: 向上止损 (尽量切在它头顶，力保下一张图包含完整的该元素)
        const upY = findGapBefore(boundaries, spanningBoundary);
        
        // 要求：往上缩，至少切下来的图得有 H_MAX 的 20% 那么高（不能切一张两三百像素的废片出来）
        if (upY !== -1 && upY > prevY + (H_MAX * 0.2)) {
          slicePoints.push(upY);
          prevY = upY;
        } else {
          // Fallback 2: 向下延展忍受
          const downY = findGapAfter(boundaries, spanningBoundary);
          // 要求：它自己和前序元素的总高不能突破 10000 像素的 X/Twitter 平台硬上限
          if (downY !== -1 && downY - prevY <= ABS_MAX) {
            slicePoints.push(downY);
            prevY = downY;
          } else {
            // Fallback 3: 暴力截走 (此图自身已经打破了物理长度平衡，强行下刀切纸)
            const hardY = prevY + H_MAX;
            slicePoints.push(hardY);
            prevY = hardY;
            console.warn(`[MD2POST] Hard Cut forced at Y=${hardY} due to giant unbreakable element.`);
          }
        }
      } else {
        // 极罕见防御：没有跨越元素，但也没找到 Gap（比如 DOM 树为空，或者布局崩塌算不出 Gap），走兜底定长下刀
         const hardY = prevY + H_MAX;
         slicePoints.push(hardY);
         prevY = hardY;
      }
    }
  }
  
  // 推入最后一张图的终结符
  slicePoints.push(totalHeight);
  return { slicePoints, totalSlices: N };
}

function findBestGap(boundaries: SemanticBoundary[], idealY: number, range: number, prevY: number): number {
  let highestScore = -1;
  let bestY = -1;
  let minDiff = Infinity;

  // 根据两个顶层元素之间的「空隙白边中点」寻找最优落刀处
  for (let i = 0; i < boundaries.length - 1; i++) {
    const curr = boundaries[i];
    const next = boundaries[i + 1];
    
    // 落刀点为缝隙正中
    const y = Math.floor((curr.bottom + next.top) / 2);
    
    // Gap 必须处于允许的探索视野内，且起码和上一个切点拉开一定距离以免切空
    if (y >= idealY - range && y <= idealY + range && y > prevY + 100) {
      const score = evaluateScore(curr, next);
      const diff = Math.abs(y - idealY);
      
      // 优先级最高，同等优先级找离 targetY 最近的
      if (score > highestScore || (score === highestScore && diff < minDiff)) {
        highestScore = score;
        bestY = y;
        minDiff = diff;
      }
    }
  }
  return bestY;
}

// 依据最佳实践定下的积分制
function evaluateScore(curr: SemanticBoundary, next: SemanticBoundary): number {
  const type = next.type;
  if (type === 'h1' || type === 'h2') return 100; // 最完美：大章节标题前
  if (type === 'h3' || type === 'h4') return 80;  // 很完美：小章节前
  if (type === 'p' && curr.type === 'p') return 60; // 段落间隙
  if (curr.type === 'img' || curr.type === 'figure' || curr.type === 'picture') return 40; // 截在某个图库后面
  return 20; // 其余常规间距兜底
}

function findGapBefore(boundaries: SemanticBoundary[], target: SemanticBoundary): number {
  const idx = boundaries.indexOf(target);
  if (idx > 0) {
    const prev = boundaries[idx - 1];
    return Math.floor((prev.bottom + target.top) / 2);
  }
  return -1;
}

function findGapAfter(boundaries: SemanticBoundary[], target: SemanticBoundary): number {
  const idx = boundaries.indexOf(target);
  if (idx < boundaries.length - 1 && idx !== -1) {
    const next = boundaries[idx + 1];
    return Math.floor((target.bottom + next.top) / 2);
  }
  return -1;
}
