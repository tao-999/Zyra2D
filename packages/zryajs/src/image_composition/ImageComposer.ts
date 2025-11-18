// packages/zryajs/src/image_composition/ImageComposer.ts

export interface ImageCompositionLayer {
  image: CanvasImageSource;
  x: number;
  y: number;
  opacity?: number;
}

/**
 * 把多张图层按顺序画到一个目标 canvas 上。
 * 用于做离屏渲染 / 合成贴图。
 */
export function composeToCanvas(
  target: HTMLCanvasElement,
  layers: ImageCompositionLayer[]
): void {
  const ctx = target.getContext("2d");
  if (!ctx) {
    throw new Error(
      "[zryajs] ImageComposer: Canvas 2D context not supported"
    );
  }

  ctx.clearRect(0, 0, target.width, target.height);

  for (const layer of layers) {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.drawImage(layer.image, layer.x, layer.y);
    ctx.restore();
  }
}
