/**
 * 抽象渲染接口。具体实现可以是 Canvas2D / WebGL2。
 */
export interface Renderer {
  /** 清屏 */
  clear(): void;

  /** 一帧开始的批处理入口 */
  begin(): void;

  /**
   * 绘制精灵：
   * - (x, y): 屏幕坐标
   * - rotation: 旋转（弧度）
   * - scaleX / scaleY: 缩放
   * - originX / originY: 局部坐标原点（默认图片中心）
   */
  drawSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX?: number,
    originY?: number
  ): void;

  /**
   * 绘制矩形（用于 debug 或简单 UI）
   */
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
  ): void;

  /**
   * 绘制文本（屏幕坐标）
   */
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
  ): void;

  /** 一帧结束 */
  end(): void;

  /** 运行时修改清屏颜色 */
  setClearColor(color: string): void;

  /** 视口尺寸变化时调用 */
  resize(width: number, height: number): void;
}
