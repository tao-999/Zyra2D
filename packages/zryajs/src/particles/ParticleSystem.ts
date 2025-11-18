// packages/zryajs/src/particles/ParticleSystem.ts

import { Vec2 } from "../math/Vec2";

export interface Particle {
  position: Vec2;
  velocity: Vec2;
  lifetime: number;
  age: number;
  [key: string]: any;
}

/**
 * 粒子发射器基础类：
 * - 控制生成速率、最大数量
 * - 更新位置 / 生命周期
 * - 具体粒子属性和衰减逻辑由子类实现
 */
export class ParticleEmitter {
  particles: Particle[] = [];
  maxParticles: number;
  spawnRate: number; // 粒子/秒

  private spawnRemainder = 0;

  constructor(opts: { maxParticles?: number; spawnRate?: number } = {}) {
    this.maxParticles = opts.maxParticles ?? 256;
    this.spawnRate = opts.spawnRate ?? 0;
  }

  protected createParticle(): Particle {
    // 默认实现：静止粒子，可在子类覆盖
    return {
      position: new Vec2(),
      velocity: new Vec2(),
      lifetime: 1,
      age: 0
    };
  }

  protected updateParticle(p: Particle, dt: number): void {
    // 子类重写，做颜色/缩放衰减等
    void p;
    void dt;
  }

  update(dt: number): void {
    // 生成新粒子
    if (this.spawnRate > 0) {
      const toSpawnFloat = this.spawnRate * dt + this.spawnRemainder;
      let toSpawn = Math.floor(toSpawnFloat);
      this.spawnRemainder = toSpawnFloat - toSpawn;

      while (toSpawn > 0 && this.particles.length < this.maxParticles) {
        this.particles.push(this.createParticle());
        toSpawn--;
      }
    }

    // 更新已有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.lifetime) {
        this.particles.splice(i, 1);
        continue;
      }

      // 位置积分
      p.position.add(p.velocity.clone().scale(dt));

      // 子类自定义逻辑（颜色/大小等）
      this.updateParticle(p, dt);
    }
  }
}

// ====================================================================
// 一个实用的“点喷射”粒子发射器实现：SimpleParticleEmitter
// ====================================================================

export interface SimpleParticleEmitterOptions {
  /** 最大粒子数，默认 256 */
  maxParticles?: number;
  /** 生成速率（粒子/秒），默认 120 */
  spawnRate?: number;
  /** 每个粒子寿命（秒），默认 0.6 */
  lifetime?: number;
  /** 初速度最小值，默认 50 */
  speedMin?: number;
  /** 初速度最大值，默认 150 */
  speedMax?: number;
  /** 喷射角度中心（弧度），默认 -Math.PI / 2（向上） */
  direction?: number;
  /** 喷射角度散布（弧度），默认 Math.PI / 4 */
  spread?: number;
  /** 重力加速度（y 方向），默认 0 */
  gravity?: number;

  /** 初始大小，默认 3 */
  sizeStart?: number;
  /** 结束大小，默认 0 */
  sizeEnd?: number;

  /** 初始颜色，默认 "#ffcc00" */
  colorStart?: string;
  /** 结束颜色，默认 "#ff0000" */
  colorEnd?: string;
}

/**
 * SimpleParticleEmitter：
 * - 从原点喷射一团粒子（你可以通过组件把原点移动到世界任意位置）
 * - 带寿命、速度、重力、颜色渐变、大小渐变
 */
export class SimpleParticleEmitter extends ParticleEmitter {
  readonly lifetime: number;
  readonly speedMin: number;
  readonly speedMax: number;
  readonly direction: number;
  readonly spread: number;
  readonly gravity: number;

  readonly sizeStart: number;
  readonly sizeEnd: number;

  readonly colorStart: string;
  readonly colorEnd: string;

  constructor(opts: SimpleParticleEmitterOptions = {}) {
    super({
      maxParticles: opts.maxParticles ?? 256,
      spawnRate: opts.spawnRate ?? 120
    });

    this.lifetime = opts.lifetime ?? 0.6;
    this.speedMin = opts.speedMin ?? 50;
    this.speedMax = opts.speedMax ?? 150;
    this.direction = opts.direction ?? -Math.PI / 2; // 默认向上喷
    this.spread = opts.spread ?? (Math.PI / 4);
    this.gravity = opts.gravity ?? 0;

    this.sizeStart = opts.sizeStart ?? 3;
    this.sizeEnd = opts.sizeEnd ?? 0;

    this.colorStart = opts.colorStart ?? "#ffcc00";
    this.colorEnd = opts.colorEnd ?? "#ff0000";
  }

  protected createParticle(): Particle {
    const halfSpread = this.spread * 0.5;
    const angle = this.direction + (Math.random() * this.spread - halfSpread);
    const speed =
      this.speedMin +
      Math.random() * (this.speedMax - this.speedMin);

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const p: Particle = {
      position: new Vec2(0, 0),
      velocity: new Vec2(vx, vy),
      lifetime: this.lifetime,
      age: 0,

      size: this.sizeStart,
      sizeStart: this.sizeStart,
      sizeEnd: this.sizeEnd,
      color: this.colorStart,
      colorStart: this.colorStart,
      colorEnd: this.colorEnd
    };

    return p;
  }

  protected updateParticle(p: Particle, dt: number): void {
    // 简单重力：只影响 vy
    if (this.gravity !== 0) {
      p.velocity.y += this.gravity * dt;
    }

    const t = p.age / p.lifetime;
    const clampedT = t < 0 ? 0 : t > 1 ? 1 : t;

    // 大小插值
    p.size =
      p.sizeStart +
      (p.sizeEnd - p.sizeStart) * clampedT;

    // 颜色插值
    p.color = lerpColor(p.colorStart, p.colorEnd, clampedT);
  }
}

// ====================================================================
// 颜色插值工具（内部使用）
// ====================================================================

function lerpColor(a: string, b: string, t: number): string {
  const c1 = parseHexColor(a);
  const c2 = parseHexColor(b);
  const u = t < 0 ? 0 : t > 1 ? 1 : t;

  const r = Math.round(c1.r + (c2.r - c1.r) * u);
  const g = Math.round(c1.g + (c2.g - c1.g) * u);
  const b2 = Math.round(c1.b + (c2.b - c1.b) * u);

  return `rgb(${r},${g},${b2})`;
}

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  let s = hex.trim().toLowerCase();
  if (s.startsWith("#")) s = s.slice(1);
  if (s.length === 3) {
    s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  if (s.length !== 6) {
    // 兜底成白色
    return { r: 255, g: 255, b: 255 };
  }
  const n = parseInt(s, 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff
  };
}
