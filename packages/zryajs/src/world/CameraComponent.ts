// packages/zryajs/src/world/CameraComponent.ts

import type { World2D } from "./World2D";
import type { Renderer } from "../render/Renderer";
import type { PositionComponent } from "../component/PositionComponent";

/**
 * CameraComponent：控制视口/缩放/旋转。
 * 通过 renderWorld(renderer, world) 把世界画出来。
 */
export class CameraComponent {
  // 世界视图中心点坐标（相机看向的点）
  x = 0;
  y = 0;

  // 缩放 & 旋转
  zoom = 1;
  angle = 0; // radians

  // 视口尺寸（屏幕像素），由 Renderer/宿主设置
  viewportWidth = 800;
  viewportHeight = 600;

  // 跟随目标（可选）
  followTarget: PositionComponent | null = null;

  /**
   * 每帧更新相机状态：
   * - 如果设置了 followTarget，就让相机中心跟随目标的位置
   */
  update(dt: number): void {
    // 目前 follow 逻辑是“硬跟随”：相机中心 = 目标位置
    // 后面如果要做平滑跟随，在这里加插值即可
    void dt;

    const target = this.followTarget;
    if (target) {
      this.x = target.x;
      this.y = target.y;
    }
  }

  /**
   * 用当前相机参数渲染整个世界。
   */
  renderWorld(renderer: Renderer, world: World2D): void {
    renderer.beginCamera(this);
    world._render(renderer);
    renderer.endCamera();
  }
}
