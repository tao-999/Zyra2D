// packages/zryajs/src/layout/LayoutComponent.ts

import { PositionComponent } from "../component/PositionComponent";

export type LayoutDirection = "horizontal" | "vertical";

/**
 * 很简单的布局组件：
 * - 把 PositionComponent 子节点按行/列排布
 * - 宽高用子组件自己的 width/height
 */
export class LayoutComponent extends PositionComponent {
  direction: LayoutDirection = "horizontal";
  spacing = 4;

  override update(dt: number): void {
    void dt;

    let offset = 0;

    for (const child of this.children) {
      if (!(child instanceof PositionComponent)) continue;

      if (this.direction === "horizontal") {
        child.x = this.x + offset;
        child.y = this.y;
        offset += child.width + this.spacing;
      } else {
        child.x = this.x;
        child.y = this.y + offset;
        offset += child.height + this.spacing;
      }
    }
  }
}
