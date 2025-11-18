import type { Renderer } from './Renderer';

/**
 * Simple Canvas2D renderer, used as v0.1 implementation & fallback.
 */
export class Canvas2DRenderer implements Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly background: string;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    backgroundColor: string = '#000000'
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Zyra2D: Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.background = backgroundColor;
  }

  clear(): void {
    const { ctx, canvas } = this;
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  begin(): void {
    // No-op for Canvas2D
  }

  drawSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number
  ): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
  }

  end(): void {
    // No-op for Canvas2D
  }
}
