import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Camera2D } from '../../render/Camera2D';
import { Transform } from '../components/Transform';
import { ColliderAABB } from '../components/ColliderAABB';

/**
 * DebugDrawSystem：
 * - 把 ColliderAABB 画成矩形框，用于调试碰撞体
 * - 建议在渲染链路里放在 RenderSystem / TextRenderSystem 之后
 */
export class DebugDrawSystem extends System {
  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera2D,
    private readonly color: string = '#00ff00'
  ) {
    super();
  }

  update(dt: number): void {
    void dt;

    const zoom = this.camera.zoom;

    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const c = e.getComponent(ColliderAABB);
      if (!t || !c || c.width <= 0 || c.height <= 0) continue;

      const worldX = t.x + c.offsetX;
      const worldY = t.y + c.offsetY;

      const screenPos = this.camera.worldToScreen(worldX, worldY);
      const w = c.width * zoom;
      const h = c.height * zoom;

      this.renderer.drawRect(screenPos.x, screenPos.y, w, h, {
        color: this.color,
        lineWidth: 1,
        filled: false,
      });
    }
  }
}
