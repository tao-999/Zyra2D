// packages/zryajs/src/effects/Effect.ts

import type { Renderer } from "../render/Renderer";

export interface Effect {
  /** 是否启用该效果 */
  active: boolean;

  /** 每帧更新内部状态（计时、插值等） */
  update(dt: number): void;

  /** 可选：在世界渲染前应用（如相机抖动前置变换等） */
  applyBeforeRender?(renderer: Renderer): void;

  /** 可选：在世界渲染后应用（如屏幕闪白、淡入淡出等） */
  applyAfterRender?(renderer: Renderer): void;
}

/**
 * EffectManager：集中管理屏幕/摄像机级别效果。
 * 使用方式：
 *   game.effects.add(new SomeEffect());
 *   // ZryaGame 内部会在 update / render 阶段自动调用
 */
export class EffectManager {
  private effects = new Set<Effect>();

  add(effect: Effect): Effect {
    this.effects.add(effect);
    return effect;
  }

  remove(effect: Effect): void {
    this.effects.delete(effect);
  }

  /** 在 Game.update 阶段调用 */
  update(dt: number): void {
    for (const e of this.effects) {
      if (!e.active) continue;
      e.update(dt);
    }
  }

  /** 在渲染世界之前调用 */
  beforeRender(renderer: Renderer): void {
    for (const e of this.effects) {
      if (!e.active) continue;
      e.applyBeforeRender?.(renderer);
    }
  }

  /** 在渲染世界之后调用 */
  afterRender(renderer: Renderer): void {
    for (const e of this.effects) {
      if (!e.active) continue;
      e.applyAfterRender?.(renderer);
    }
  }

  clear(): void {
    this.effects.clear();
  }
}
