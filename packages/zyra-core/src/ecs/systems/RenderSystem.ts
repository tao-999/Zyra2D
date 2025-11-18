import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Transform } from '../components/Transform';
import { Sprite } from '../components/Sprite';

/**
 * RenderSystem: iterates entities and draws all with (Transform + Sprite).
 */
export class RenderSystem extends System {
  constructor(private readonly renderer: Renderer) {
    super();
  }

  update(dt: number): void {
    // dt currently not used, but kept for future interpolation.
    void dt;

    this.renderer.clear();
    this.renderer.begin();

    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const s = e.getComponent(Sprite);
      if (!t || !s || !s.image) continue;

      this.renderer.drawSprite(
        s.image,
        t.x,
        t.y,
        t.rotation,
        t.scaleX,
        t.scaleY
      );
    }

    this.renderer.end();
  }
}
