import { System } from '../core/System';
import type { Renderer } from '../render/Renderer';
import { UIRect } from './UIRect';
import { UIText } from './UIText';

export class UIRenderSystem extends System {
  constructor(private readonly renderer: Renderer) {
    super();
  }

  update(dt: number): void {
    void dt;

    for (const e of this.world.entities) {
      const rect = e.getComponent(UIRect);
      if (rect) {
        this.renderer.drawRect(rect.x, rect.y, rect.width, rect.height, {
          filled: true,
          color: rect.color,
        });
      }

      const text = e.getComponent(UIText);
      if (text && text.text) {
        this.renderer.drawText(text.text, text.x, text.y, {
          font: text.font,
          color: text.color,
          textAlign: text.align,
          textBaseline: text.baseline,
        });
      }
    }
  }
}
