import sharp from 'sharp';
import { resolve, parse } from 'path';

/**
 * 接受 Playwright 产出的长图全景内存 Buffer 并切割导出
 * @param fullPageBuffer 原始全流截图内存块 (Retina @2x 的话物理分辨率已翻倍)
 * @param slicePoints 切分的 CSS 逻辑像素坐标点数组 [第一张底y, 第二张底y, ..., 最终底y]
 * @param baseOutputPath 期望输出的目录及名称，带 .png (会自动加上 _1of3 重塑扩展名)
 * @param deviceScaleFactor 用于矫正图像坐标切分系的 Retina 比例尺度（默认为 2）
 * @returns 落地的文件绝对路径
 */
export async function sliceAndExport(
  fullPageBuffer: Buffer,
  slicePoints: number[],
  baseOutputPath: string,
  deviceScaleFactor: number = 2
): Promise<string[]> {
  const generatedFiles: string[] = [];
  const parsedPath = parse(resolve(process.cwd(), baseOutputPath));
  
  let currentY = 0;
  
  // 必须遍历切割
  for (let i = 0; i < slicePoints.length; i++) {
    const endY = slicePoints[i];
    let height = endY - currentY;
    
    // 把 CSS 逻辑坐标系按比例映射回纯物理截图坐标系
    const physicalTop = Math.floor(currentY * deviceScaleFactor);
    const physicalHeight = Math.ceil(height * deviceScaleFactor);
    const physicalWidth = 1080 * deviceScaleFactor;
    
    // 如果存在微小四舍五入溢出（例如 fullBuffer 差个 1px，导致越界），sharp 会崩溃
    // 所以提取需要结合图像真实尺寸进行软钳制
    const meta = await sharp(fullPageBuffer).metadata();
    const actualTotalHeight = meta.height || physicalTop + physicalHeight; // fail-safe
    
    // 钳制物理可截高度
    const safeHeight = Math.min(physicalHeight, actualTotalHeight - physicalTop);

    const suffix = slicePoints.length > 1 ? `_${i + 1}of${slicePoints.length}` : '';
    const outputPath = resolve(parsedPath.dir, `${parsedPath.name}${suffix}.png`);
    
    await sharp(fullPageBuffer)
      .extract({ 
        left: 0, 
        top: physicalTop, 
        width: physicalWidth, 
        height: safeHeight 
      })
      .png({ quality: 100 }) // 最大质量抗木马算法（Twitter png 算法）
      .toFile(outputPath);
      
    generatedFiles.push(outputPath);
    
    currentY = endY;
  }
  
  return generatedFiles;
}
