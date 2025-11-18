import type { Component } from '../../core/Component';
import type { Entity } from '../../core/Entity';
import type { BlendMode } from '../../render/Renderer';

export interface Particle2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  angularVel: number;
  r: number;
  g: number;
  b: number;
  a: number;

  /** 这个粒子使用的贴图（优先级高于 emitter.image） */
  image?: HTMLImageElement;
}

export type ParticleSpawnShape = 'point' | 'circle' | 'box';

export interface ParticleEmitter2D extends Component {
  active: boolean;
  emissionRate: number;
  emissionAccumulator: number;

  lifeMin: number;
  lifeMax: number;

  speedMin: number;
  speedMax: number;

  angleMin: number;
  angleMax: number;

  gravityY: number;

  sizeMin: number;
  sizeMax: number;

  startAlpha: number;
  endAlpha: number;

  colorStart: [number, number, number];
  colorEnd: [number, number, number];

  spawnShape: ParticleSpawnShape;
  radiusX: number;
  radiusY: number;

  maxParticles: number;
  particles: Particle2D[];

  burstPending: number;

  /**
   * 单张粒子贴图（兼容旧用法）
   */
  image?: HTMLImageElement;

  /**
   * 粒子贴图数组：
   * - 若存在，则每个新粒子会从中随机选一张图
   */
  images?: HTMLImageElement[];

  /**
   * 是否用 sprite 渲染（否则用 drawRect）
   */
  useSprite?: boolean;

  /**
   * 混合模式：alpha（普通） / additive（发光）
   */
  blendMode: BlendMode;

  entity: Entity;
}

export function createParticleEmitter2D(
  partial?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return {
    active: true,
    emissionRate: 50,
    emissionAccumulator: 0,

    lifeMin: 0.4,
    lifeMax: 0.9,

    speedMin: 80,
    speedMax: 160,

    angleMin: -Math.PI / 4,
    angleMax: Math.PI / 4,

    gravityY: 600,

    sizeMin: 4,
    sizeMax: 10,

    startAlpha: 1,
    endAlpha: 0,

    colorStart: [1, 0.8, 0.2],
    colorEnd: [1, 0.2, 0],

    spawnShape: 'point',
    radiusX: 0,
    radiusY: 0,

    maxParticles: 300,
    particles: [],

    burstPending: 0,

    image: undefined,
    images: undefined,
    useSprite: false,

    blendMode: 'alpha',

    ...(partial ?? {}),
  } as ParticleEmitter2D;
}

export function triggerParticleBurst(
  emitter: ParticleEmitter2D,
  count: number
): void {
  emitter.burstPending += count;
}
