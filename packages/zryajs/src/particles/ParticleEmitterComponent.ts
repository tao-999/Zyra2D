// packages/zryajs/src/particles/ParticleEmitterComponent.ts

import { PositionComponent } from "../component/PositionComponent";
import type { Renderer } from "../render/Renderer";
import { ParticleEmitter, SimpleParticleEmitter } from "./ParticleSystem";
import type { Particle } from "./ParticleSystem";
import type { CanvasRenderer } from "../render/CanvasRenderer";

/**
 * 粒子发射器组件：
 * - 可以挂到 world.root 或任意节点下面
 * - 继承 PositionComponent：自身位置作为发射器原点偏移
 * - 持有一个 ParticleEmitter，update 时自动更新，render 时画出来
 */
export class ParticleEmitterComponent extends PositionComponent {
  emitter: ParticleEmitter;

  /**
   * @param emitter 若不传，则默认创建一个 SimpleParticleEmitter
   */
  constructor(emitter?: ParticleEmitter) {
    super();
    this.emitter = emitter ?? new SimpleParticleEmitter();
  }

  override update(dt: number): void {
    this.emitter.update(dt);
  }

  override render(renderer: Renderer): void {
    // 当前只对 CanvasRenderer 做实现
    const canvasRenderer = renderer as CanvasRenderer | any;
    const ctx: CanvasRenderingContext2D | undefined = canvasRenderer.ctx;
    if (!ctx) return;

    ctx.save();

    // 应用自身 transform（只做位置 + 旋转 + 缩放，简单版）
    ctx.translate(this.x, this.y);
    if (this.angle !== 0) {
      ctx.rotate(this.angle);
    }
    if (this.scaleX !== 1 || this.scaleY !== 1) {
      ctx.scale(this.scaleX, this.scaleY);
    }

    // 简单画法：每个粒子画一个小圆点
    const particles: Particle[] = this.emitter.particles;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i] as any;

      const px = p.position.x;
      const py = p.position.y;
      const size: number = p.size ?? 2;
      const color: string = p.color ?? "#ffffff";

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
