import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Camera2D } from '../../render/Camera2D';
import { Transform } from '../components/Transform';
import { Text2D } from '../components/Text2D';

/**
 * 文本渲染系统：
 * - 遍历拥有 Transform + Text2D 的实体
 * - 用 Camera2D 做 world -> screen
 * - 再调用 renderer.drawText
 *
 * 注意：系统应该在 RenderSystem 之后注册，这样文字会叠在精灵上面。
 */
export class TextRenderSystem extends System {
  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera2D
  ) {
    super();
  }

  update(dt: number): void {
    void dt;

    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const text = e.getComponent(Text2D);
      if (!t || !text || !text.text) continue;

      const { x, y } = this.camera.worldToScreen(t.x, t.y);

      let textAlign: CanvasTextAlign = 'left';
      if (text.align === 'center') textAlign = 'center';
      else if (text.align === 'right') textAlign = 'right';

      let textBaseline: CanvasTextBaseline = 'top';
      if (text.verticalAlign === 'middle') textBaseline = 'middle';
      else if (text.verticalAlign === 'bottom') textBaseline = 'bottom';

      this.renderer.drawText(text.text, x, y, {
        font: text.font,
        color: text.color,
        textAlign,
        textBaseline,
        maxWidth: text.maxWidth,
      });
    }
  }
}
