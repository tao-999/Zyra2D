import { System } from '../../core/System';
import type { Entity } from '../../core/Entity';
import { Transform } from '../components/Transform';
import { Camera2D } from '../../render/Camera2D';

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface CameraFollowOptions {
  /** 相机相对目标的位置偏移（世界坐标） */
  offsetX?: number;
  offsetY?: number;

  /**
   * 平滑系数，0~1：
   * - 1：瞬间跟随
   * - 0.1：稍微拖尾
   */
  smoothFactor?: number;

  /** 可选相机世界边界 */
  bounds?: CameraBounds | null;
}

/**
 * CameraFollowSystem：
 * - 让相机平滑跟随一个目标实体（通常是玩家）
 * - 支持偏移 & 世界边界限制
 *
 * 使用方式：
 *   const follow = new CameraFollowSystem(camera, () => playerEntity, { smoothFactor: 0.2 });
 *   world.addSystem(follow);
 */
export class CameraFollowSystem extends System {
  private options: Required<CameraFollowOptions>;

  /**
   * @param camera 要控制的相机
   * @param getTarget 每帧获取要跟随的实体（可以处理中途切换目标/死亡的情况）
   * @param options 可选配置
   */
  constructor(
    private readonly camera: Camera2D,
    private readonly getTarget: () => Entity | null,
    options?: CameraFollowOptions
  ) {
    super();

    this.options = {
      offsetX: options?.offsetX ?? 0,
      offsetY: options?.offsetY ?? 0,
      smoothFactor: options?.smoothFactor ?? 1,
      bounds: options?.bounds ?? null,
    };
  }

  update(dt: number): void {
    void dt;

    const target = this.getTarget();
    if (!target) return;

    const t = target.getComponent(Transform);
    if (!t) return;

    const { offsetX, offsetY, smoothFactor, bounds } = this.options;

    // 目标相机位置
    let targetX = t.x + offsetX;
    let targetY = t.y + offsetY;

    // 边界限制：以相机中心为基准，保证视口不超出世界
    if (bounds) {
      const halfW = this.camera.viewportWidth / (2 * this.camera.zoom);
      const halfH = this.camera.viewportHeight / (2 * this.camera.zoom);

      const minX = bounds.minX + halfW;
      const maxX = bounds.maxX - halfW;
      const minY = bounds.minY + halfH;
      const maxY = bounds.maxY - halfH;

      if (minX <= maxX) {
        targetX = Math.min(Math.max(targetX, minX), maxX);
      }
      if (minY <= maxY) {
        targetY = Math.min(Math.max(targetY, minY), maxY);
      }
    }

    // 平滑插值
    const s = Math.min(Math.max(smoothFactor, 0), 1);
    if (s <= 0) return;

    this.camera.x += (targetX - this.camera.x) * s;
    this.camera.y += (targetY - this.camera.y) * s;
  }
}
