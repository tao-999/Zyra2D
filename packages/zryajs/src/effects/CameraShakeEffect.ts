// packages/zryajs/src/effects/CameraShakeEffect.ts

import type { Effect } from "./Effect";
import type { CameraComponent } from "../world/CameraComponent";

/**
 * CameraShakeEffect：
 * - 在一段时间内给相机叠加随机抖动偏移
 * - 不直接改 Renderer，只在 applyBeforeRender / applyAfterRender 里加减相机偏移
 *
 * 用法：
 *   const shake = new CameraShakeEffect(game.camera, { duration: 0.4, amplitude: 12 });
 *   game.effects.add(shake);
 */
export interface CameraShakeOptions {
  /** 抖动持续时间（秒），默认 0.3 */
  duration?: number;
  /** 初始抖动幅度（像素），默认 8 */
  amplitude?: number;
  /** 抖动频率（每秒“抖”的次数），默认 25 */
  frequency?: number;
  /** 幅度随时间的衰减（0~1，越大衰减越快），默认 1 */
  decay?: number;
}

export class CameraShakeEffect implements Effect {
  active = true;

  private readonly camera: CameraComponent;
  private readonly duration: number;
  private readonly amplitude: number;
  private readonly frequency: number;
  private readonly decay: number;

  private elapsed = 0;
  private phase = 0;
  private offsetX = 0;
  private offsetY = 0;

  constructor(camera: CameraComponent, opts: CameraShakeOptions = {}) {
    this.camera = camera;
    this.duration = opts.duration ?? 0.3;
    this.amplitude = opts.amplitude ?? 8;
    this.frequency = opts.frequency ?? 25;
    this.decay = opts.decay ?? 1;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      // 结束抖动
      this.active = false;
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    // 剩余比例（1 -> 0）
    const t = 1 - this.elapsed / this.duration;
    const amp = this.amplitude * Math.pow(t, this.decay);

    // 更新相位 & 生成一个简单的随机方向
    this.phase += this.frequency * dt * 2 * Math.PI;

    const angle = this.phase + Math.random() * 0.5; // 增加一点随机性
    this.offsetX = Math.cos(angle) * amp;
    this.offsetY = Math.sin(angle) * amp;
  }

  /**
   * 在渲染前，把抖动偏移叠加到相机上。
   */
  applyBeforeRender(): void {
    if (!this.active) return;
    this.camera.x += this.offsetX;
    this.camera.y += this.offsetY;
  }

  /**
   * 在渲染后，把相机位置还原。
   */
  applyAfterRender(): void {
    if (!this.active) return;
    this.camera.x -= this.offsetX;
    this.camera.y -= this.offsetY;
  }
}
