/**
 * 简单的 2D 相机：
 * - 维护一个世界坐标下的相机位置 (x, y)
 * - 维护缩放 zoom
 * - 视口大小由引擎初始化时传入
 *
 * 约定：
 * - (x, y) 表示“相机中心”在世界坐标中的位置
 * - world -> screen 转换：
 *   screenX = (worldX - x) * zoom + viewportWidth  / 2
 *   screenY = (worldY - y) * zoom + viewportHeight / 2
 */
export class Camera2D {
  x = 0;
  y = 0;
  zoom = 1;

  readonly viewportWidth: number;
  readonly viewportHeight: number;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  /** 世界坐标 -> 屏幕坐标 */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const sx = (worldX - this.x) * this.zoom + this.viewportWidth / 2;
    const sy = (worldY - this.y) * this.zoom + this.viewportHeight / 2;
    return { x: sx, y: sy };
  }
}
