// src/ecs/systems/ParticleSystem2D.ts

import type { System } from '../../core/System';
import type { World } from '../../core/World';
import type { Renderer, BlendMode } from '../../render/Renderer';
import type { Camera2D } from '../../render/Camera2D';

import { Transform } from '../components/Transform';
import {
  type ParticleEmitter2D,
  type Particle2D,
  type ParticleSpawnShape,
} from '../components/ParticleEmitter2D';

/**
 * 粒子系统：
 * - 遍历所有有 Transform + ParticleEmitter2D 的实体
 * - 更新粒子（速度 / 重力 / 寿命）
 * - 使用 Renderer 绘制粒子
 */
export class ParticleSystem2D implements System {
  /** World.addSystem 时会注入 */
  world!: World;

  /** 建议：放在 TileMapRenderSystem 和 RenderSystem 之间 */
  priority = 45;

  private renderer: Renderer;
  private camera: Camera2D;

  private currentBlendMode: BlendMode = 'alpha';

  constructor(renderer: Renderer, camera: Camera2D) {
    this.renderer = renderer;
    this.camera = camera;
  }

  /** 符合 System 接口签名：只接收 dt */
  update(dt: number): void {
    const world = this.world;
    const entities = world.entities;

    for (const e of entities) {
      const transform = e.getComponent(Transform);
      const emitter = e.getComponent<ParticleEmitter2D>(
        // 这里传的是构造函数占位，为了通过类型检查；
        // 实际你的 Entity.getComponent 实现可以根据项目调整。
        (null as unknown) as new (...args: any[]) => ParticleEmitter2D
      );

      if (!transform || !emitter || !emitter.active) continue;

      this.updateEmitter(emitter, transform, dt);
      this.renderEmitter(emitter);
    }
  }

  private updateEmitter(
    emitter: ParticleEmitter2D,
    transform: Transform,
    dt: number
  ): void {
    const particles = emitter.particles;

    // 1) 更新已有粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // 重力
      p.vy += emitter.gravityY * dt;

      // 移动
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.rotation += p.angularVel * dt;

      // 寿命
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // 2) 计算这帧要生成多少个粒子（连续 + 爆炸）
    let spawnCount = 0;

    // 连续模式
    if (emitter.emissionRate > 0) {
      emitter.emissionAccumulator += dt * emitter.emissionRate;
      const continuousCount = Math.floor(emitter.emissionAccumulator);
      if (continuousCount > 0) {
        emitter.emissionAccumulator -= continuousCount;
        spawnCount += continuousCount;
      }
    }

    // 一次性爆炸
    if (emitter.burstPending > 0) {
      spawnCount += emitter.burstPending;
      emitter.burstPending = 0;
    }

    if (spawnCount <= 0) return;

    for (let i = 0; i < spawnCount; i++) {
      if (particles.length >= emitter.maxParticles) break;

      const p = this.createParticle(emitter, transform);
      particles.push(p);
    }
  }

  private createParticle(
    emitter: ParticleEmitter2D,
    transform: Transform
  ): Particle2D {
    const angle = randRange(emitter.angleMin, emitter.angleMax);
    const speed = randRange(emitter.speedMin, emitter.speedMax);

    const life = randRange(emitter.lifeMin, emitter.lifeMax);
    const size = randRange(emitter.sizeMin, emitter.sizeMax);

    // 起始位置：根据发射形状决定偏移
    const [offsetX, offsetY] = sampleSpawnOffset(
      emitter.spawnShape,
      emitter.radiusX,
      emitter.radiusY
    );

    // 世界坐标
    const baseX = transform.x + offsetX;
    const baseY = transform.y + offsetY;

    const [sr, sg, sb] = emitter.colorStart;

    // 为这个粒子选择一张贴图
    let img: HTMLImageElement | undefined = emitter.image;
    const list = emitter.images;
    if (list && list.length > 0) {
      const idx = Math.floor(Math.random() * list.length);
      img = list[idx];
    }

    const p: Particle2D = {
      x: baseX,
      y: baseY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size,
      rotation: randRange(-Math.PI, Math.PI),
      angularVel: randRange(-5, 5),
      r: sr,
      g: sg,
      b: sb,
      a: emitter.startAlpha,
      image: img,
    };

    return p;
  }

  /** 内部：根据 emitter 的 blendMode 切换渲染器混合模式 */
  private setRendererBlendMode(mode: BlendMode): void {
    if (this.currentBlendMode === mode) return;
    this.currentBlendMode = mode;

    if (typeof this.renderer.setBlendMode === 'function') {
      this.renderer.setBlendMode(mode);
    }
  }

  private renderEmitter(emitter: ParticleEmitter2D): void {
    const camera = this.camera;
    const renderer = this.renderer;
    const particles = emitter.particles;

    if (particles.length === 0) return;

    // 按发射器配置切换混合模式（alpha / additive）
    this.setRendererBlendMode(emitter.blendMode);

    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;

    const halfW = vw / 2;
    const halfH = vh / 2;

    const [sr, sg, sb] = emitter.colorStart;
    const [er, eg, eb] = emitter.colorEnd;

    const useSprite = !!emitter.useSprite;

    for (const p of particles) {
      const t = 1 - p.life / p.maxLife; // 0 ~ 1

      // 颜色渐变：start → end
      const r = sr * (1 - t) + er * t;
      const g = sg * (1 - t) + eg * t;
      const b = sb * (1 - t) + eb * t;

      // 透明度渐变
      const a =
        emitter.startAlpha * (1 - t) + emitter.endAlpha * t;

      // 世界坐标 -> 屏幕坐标
      const sx = (p.x - camera.x) * camera.zoom + halfW;
      const sy = (p.y - camera.y) * camera.zoom + halfH;

      const size = p.size * camera.zoom;

      // 优先使用粒子自己的 image，其次用 emitter.image
      const img = p.image ?? emitter.image;

      if (
        useSprite &&
        img &&
        img.complete &&
        img.naturalWidth > 0
      ) {
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        const scale = size / Math.max(w, h);
        const scaleX = scale;
        const scaleY = scale;

        renderer.drawSprite(
          img,
          sx,
          sy,
          p.rotation,
          scaleX,
          scaleY,
          w / 2,
          h / 2
        );
      } else {
        // 用小方块画粒子（包含颜色渐变）
        const color = `rgba(${Math.floor(r * 255)},${Math.floor(
          g * 255
        )},${Math.floor(b * 255)},${a})`;

        renderer.drawRect(
          sx - size / 2,
          sy - size / 2,
          size,
          size,
          {
            color,
            filled: true,
          }
        );
      }
    }
  }
}

// ============ 工具函数 ============

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** 根据发射形状采样一个局部偏移 */
function sampleSpawnOffset(
  shape: ParticleSpawnShape,
  radiusX: number,
  radiusY: number
): [number, number] {
  switch (shape) {
    case 'point':
      return [0, 0];

    case 'circle': {
      const r = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const rad = r * radiusX;
      return [Math.cos(theta) * rad, Math.sin(theta) * rad];
    }

    case 'box': {
      const x = randRange(-radiusX, radiusX);
      const y = randRange(-radiusY, radiusY);
      return [x, y];
    }

    default:
      return [0, 0];
  }
}
