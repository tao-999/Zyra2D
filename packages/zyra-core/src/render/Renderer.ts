/**
 * 抽象渲染接口。具体实现可以是 Canvas2D / WebGL2。
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
