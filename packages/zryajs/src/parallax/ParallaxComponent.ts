// packages/zryajs/src/parallax/ParallaxComponent.ts

import { PositionComponent } from "../component/PositionComponent";
import type { CameraComponent } from "../world/CameraComponent";
import type { Renderer } from "../render/Renderer";

/**
 * 视差组件基类：
 * - 挂在 World 里
 * - 渲染时根据相机位置偏移
 */
export class ParallaxComponent extends PositionComponent {
  factorX = 0.5;
  factorY = 0.5;

  /**
   * 使用相机进行渲染：
   * - 按 factorX/factorY 对相机位置做缩放，实现视差效果
   * - 内部调用自身的 render(renderer)（如果实现了的话）
   */
  renderWithCamera(renderer: Renderer, camera: CameraComponent): void {
    const origX = this.x;
    const origY = this.y;

    // 根据相机位置做偏移
    this.x = origX - camera.x * this.factorX;
    this.y = origY - camera.y * this.factorY;

    // 调用自身 render（如果子类实现了）
    const self: any = this;
    if (typeof self.render === "function") {
      self.render(renderer);
    }

    // 还原坐标
    this.x = origX;
    this.y = origY;
  }
}
