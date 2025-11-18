import type { Renderer } from './Renderer';

/**
 * v0.1 的 Canvas2D 渲染实现。
 */
export class Canvas2DRenderer implements Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private clearColor: string;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    backgroundColor: string = '#000000'
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Zyra2D: Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.clearColor = backgroundColor;
  }

  setClearColor(color: string): void {
    this.clearColor = color;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear(): void {
    const { ctx, canvas } = this;
    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  begin(): void {
    // Canvas2D 无需特别处理
  }

  drawSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX?: number,
    originY?: number
  ): void {
    const { ctx } = this;

    const ox = originX ?? image.width / 2;
    const oy = originY ?? image.height / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(image, -ox, -oy);
    ctx.restore();
  }

  drawSpriteRegion(
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX?: number,
    originY?: number
  ): void {
    const { ctx } = this;

    const ox = originX ?? sw / 2;
    const oy = originY ?? sh / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(image, sx, sy, sw, sh, -ox, -oy, sw, sh);
    ctx.restore();
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: {
      color?: string;
      lineWidth?: number;
      filled?: boolean;
    }
  ): void {
    const { ctx } = this;
    const color = options?.color ?? '#00ff00';
    const lineWidth = options?.lineWidth ?? 1;
    const filled = options?.filled ?? false;

    ctx.save();
    if (filled) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      font?: string;
      color?: string;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      maxWidth?: number;
    }
  ): void {
    const { ctx } = this;
    ctx.save();

    ctx.font = options?.font ?? '16px sans-serif';
    ctx.fillStyle = options?.color ?? '#ffffff';
    ctx.textAlign = options?.textAlign ?? 'left';
    ctx.textBaseline = options?.textBaseline ?? 'alphabetic';

    if (options?.maxWidth !== undefined) {
      ctx.fillText(text, x, y, options.maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  end(): void {
    // Canvas2D 无需特别处理
  }
}
