// packages/zryajs/src/effects/BlinkEffect.ts

import type { Effect } from "./Effect";
import type { Component } from "../component/Component";

/**
 * BlinkEffect：
 * - 周期性地切换 target.visible，实现闪烁效果
 * - 可设置总时长；结束后会自动恢复为可见
 *
 * 用法：
 *   const blink = new BlinkEffect(playerSprite, { period: 0.1, duration: 1.0 });
 *   game.effects.add(blink);
 */
export interface BlinkEffectOptions {
  /** 闪烁周期（秒）：一次亮+一次灭的总时间，默认 0.2 */
  period?: number;
  /** 总持续时间（秒），默认 0.5 */
  duration?: number;
  /**
   * 占空比：0~1，表示每个周期中“可见”的比例。
   * 比如 0.5 表示半亮半灭；0.2 表示亮 20%，灭 80%。默认 0.5。
   */
  dutyCycle?: number;
}

export class BlinkEffect implements Effect {
  active = true;

  private readonly target: Component;
  private readonly period: number;
  private readonly duration: number;
  private readonly dutyCycle: number;

  private elapsed = 0;
  private originalVisible: boolean;

  constructor(target: Component, opts: BlinkEffectOptions = {}) {
    this.target = target;
    this.period = opts.period ?? 0.2;
    this.duration = opts.duration ?? 0.5;
    this.dutyCycle = opts.dutyCycle ?? 0.5;
    this.originalVisible = target.visible;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;

    if (this.elapsed >= this.duration) {
      // 结束效果，恢复可见状态
      this.active = false;
      this.target.visible = this.originalVisible;
      return;
    }

    if (this.period <= 0) {
      this.target.visible = !this.originalVisible;
      return;
    }

    const t = this.elapsed % this.period;
    const visiblePhase = this.period * this.dutyCycle;

    this.target.visible = t < visiblePhase ? this.originalVisible : !this.originalVisible;
  }

  applyBeforeRender(): void {
    // 闪烁通过修改 target.visible 实现，这里不需要额外绘制逻辑
  }

  applyAfterRender(): void {
    // 同上
  }
}
