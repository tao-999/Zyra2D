/**
 * Abstract rendering interface.
 * Concrete implementations: Canvas2D, WebGL2, etc.
 */
export interface Renderer {
  clear(): void;
  begin(): void;
  drawSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number
  ): void;
  end(): void;
}
