import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Camera2D } from '../../render/Camera2D';
import { Transform } from '../components/Transform';
import { Sprite } from '../components/Sprite';
import type { Entity } from '../../core/Entity';

/**
 * 渲染系统：遍历所有包含 Transform + Sprite 的实体并绘制。
 * 使用 Camera2D 将世界坐标转换为屏幕坐标，并按 Transform.z 排序。
 */
export class RenderSystem extends System {
  private scratch: { z: number; entity: Entity }[] = [];

  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera2D
  ) {
    super();
  }

  update(dt: number): void {
    void dt; // 暂时不用 dt

    this.renderer.clear();
    this.renderer.begin();

    const scratch = this.scratch;
    scratch.length = 0;

    // 收集所有有 Transform + Sprite 的实体
    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const s = e.getComponent(Sprite);
      if (!t || !s || !s.image) continue;
      scratch.push({ z: t.z, entity: e });
    }

    // 按 z 从小到大排序（越大的越后画）
    scratch.sort((a, b) => a.z - b.z);

    // 按排序结果绘制
    for (const item of scratch) {
      const e = item.entity;
      const t = e.getComponent(Transform)!;
      const s = e.getComponent(Sprite)!;

      const { x, y } = this.camera.worldToScreen(t.x, t.y);
      const zoom = this.camera.zoom;

      this.renderer.drawSprite(
        s.image!,
        x,
        y,
        t.rotation,
        t.scaleX * zoom,
        t.scaleY * zoom
      );
    }

    this.renderer.end();
  }
}
