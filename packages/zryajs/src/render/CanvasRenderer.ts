// packages/zryajs/src/render/CanvasRenderer.ts

import type { Renderer } from "./Renderer";
import type { CameraComponent } from "../world/CameraComponent";
import type { SpriteComponent } from "../component/SpriteComponent";
import type { TextComponent } from "../component/TextComponent";

/**
 * CanvasRenderer：使用浏览器 Canvas2D 的 Renderer 实现。
 * 不帮你创建 canvas，只负责拿到一个现成的 <canvas> 来画。
 */
export class CanvasRenderer implements Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  // 背景色（可选）
  clearColor: string | null = "#000000";

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("[zryajs] Canvas 2D context not supported");
    }

    this.canvas = canvas;
    this.ctx = ctx;
  }

  beginFrame(): void {
    const { ctx, canvas, clearColor } = this;
    if (clearColor) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = clearColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  endFrame(): void {
    // 目前不需要做事，留扩展点
  }

  beginCamera(camera: CameraComponent): void {
    const { ctx, canvas } = this;

    ctx.save();

    // 以画布中心为原点，应用相机的平移/缩放/旋转
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(camera.angle);
    ctx.translate(-camera.x, -camera.y);

    // 更新相机视口信息（方便外部查）
    camera.viewportWidth = canvas.width;
    camera.viewportHeight = canvas.height;
  }

  endCamera(): void {
    this.ctx.restore();
  }

  drawSprite(sprite: SpriteComponent): void {
    const { ctx } = this;
    const { texture } = sprite;
    if (!texture || !texture.image) return;

    const img = texture.image;
    const sx = texture.sx ?? 0;
    const sy = texture.sy ?? 0;

    const { width: srcW, height: srcH } = getSourceSize(img);
    const sw = texture.sw ?? srcW;
    const sh = texture.sh ?? srcH;

    const {
      x,
      y,
      width,
      height,
      scaleX,
      scaleY,
      angle,
      anchorX,
      anchorY
    } = sprite;

    const w = width || sw;
    const h = height || sh;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-w * anchorX, -h * anchorY);

    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      w,
      h
    );

    ctx.restore();
  }

  drawText(text: TextComponent): void {
    const { ctx } = this;
    const {
      x,
      y,
      scaleX,
      scaleY,
      angle,
      anchorX,
      anchorY,
      width,
      height
    } = text;
    const {
      fontSize,
      fontFamily,
      fontWeight,
      color,
      align,
      lineHeight,
      maxWidth
    } = text.style;

    if (!text.text) return;

    ctx.save();

    // 组合 transform
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);

    // 设置字体样式
    const size = fontSize ?? 14;
    const family = fontFamily ?? "sans-serif";
    const weight = fontWeight ?? "normal";
    const fill = color ?? "#ffffff";

    ctx.font = `${weight} ${size}px ${family}`;
    ctx.fillStyle = fill;
    ctx.textBaseline = "top";

    // 对齐 & anchor 共同决定绘制原点
    const alignMode = align ?? "left";
    ctx.textAlign = alignMode as CanvasTextAlign;

    // 文本真正绘制宽度、行高
    const lh = size * (lineHeight ?? 1.2);
    const lines = breakLines(ctx, text.text, maxWidth);

    // 基于 anchor 的偏移：这里简单处理为矩形区域的 anchor
    const totalHeight = lines.length * lh;
    const boxWidth =
      width ??
      (maxWidth ??
        Math.max(
          ...lines.map((line) => ctx.measureText(line).width),
          0
        ));

    const offsetX = -boxWidth * anchorX;
    const offsetY = -totalHeight * anchorY;

    // 逐行输出
    lines.forEach((line, i) => {
      ctx.fillText(line, offsetX, offsetY + i * lh);
    });

    // 如果用户设置了 width/height，可以将来用于 debug rect 等
    if (width) {
      // placeholder：以后可以加可视化边框
      height;
    }

    ctx.restore();
  }
}

/**
 * 简单自动换行：按空格拆分，超过 maxWidth 就换行。
 * 如果没传 maxWidth，就只按 '\n' 分行。
 */
function breakLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth?: number
): string[] {
  if (!maxWidth || maxWidth <= 0) {
    return text.split("\n");
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

/**
 * 从 CanvasImageSource 安全地拿到 width/height。
 * 兼容 Image / Canvas / Video / ImageBitmap 等。
 */
function getSourceSize(
  src: CanvasImageSource
): { width: number; height: number } {
  const anySrc: any = src;

  // Image
  if (
    typeof HTMLImageElement !== "undefined" &&
    src instanceof HTMLImageElement
  ) {
    return {
      width: src.naturalWidth || src.width,
      height: src.naturalHeight || src.height
    };
  }

  // Canvas
  if (
    typeof HTMLCanvasElement !== "undefined" &&
    src instanceof HTMLCanvasElement
  ) {
    return { width: src.width, height: src.height };
  }

  // ImageBitmap
  if (typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap) {
    return { width: src.width, height: src.height };
  }

  // Video
  if (
    typeof HTMLVideoElement !== "undefined" &&
    src instanceof HTMLVideoElement
  ) {
    return { width: src.videoWidth, height: src.videoHeight };
  }

  // 兜底：尽量从任意对象上读 width/height
  const w = Number(anySrc.width ?? 0) || 0;
  const h = Number(anySrc.height ?? 0) || 0;
  return { width: w, height: h };
}
