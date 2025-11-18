import { System } from '../core/System';
import { Input } from '../input/Input';
import { UIRect } from './UIRect';
import { UIClickable } from './UIClickable';

export class UIInteractionSystem extends System {
  constructor(private readonly input: Input) {
    super();
  }

  update(dt: number): void {
    void dt;

    if (!this.input.mousePressed(0)) return;

    const mx = this.input.mouseX;
    const my = this.input.mouseY;

    for (const e of this.world.entities) {
      const rect = e.getComponent(UIRect);
      const click = e.getComponent(UIClickable);
      if (!rect || !click || !click.onClick) continue;

      if (
        mx >= rect.x &&
        mx <= rect.x + rect.width &&
        my >= rect.y &&
        my <= rect.y + rect.height
      ) {
        click.onClick();
      }
    }
  }
}
