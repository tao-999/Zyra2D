// src/ecs/utils/ParticlePresets2D.ts

import {
  createParticleEmitter2D,
  type ParticleEmitter2D,
} from '../components/ParticleEmitter2D';

/**
 * 常见粒子类型枚举：
 *
 * - 'fireSmall' / 'fireLarge'    小/大火焰
 * - 'explosion'                  爆炸中心
 * - 'spark'                      金属火花
 * - 'smoke'                      烟雾
 * - 'magic'                      魔法光点
 * - 'snow'                       下雪
 * - 'rain'                       下雨
 * - 'dust'                       跳跃灰尘
 */
export type ParticlePresetType =
  | 'fireSmall'
  | 'fireLarge'
  | 'explosion'
  | 'spark'
  | 'smoke'
  | 'magic'
  | 'snow'
  | 'rain'
  | 'dust';

/**
 * 通用入口：
 * 一行代码创建一个内置粒子发射器
 */
export function createParticleEmitterByType(
  type: ParticlePresetType,
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  switch (type) {
    case 'fireSmall':
      return createFireEmitter({ small: true, overrides });
    case 'fireLarge':
      return createFireEmitter({ small: false, overrides });
    case 'explosion':
      return createExplosionEmitter(overrides);
    case 'spark':
      return createSparkEmitter(overrides);
    case 'smoke':
      return createSmokeEmitter(overrides);
    case 'magic':
      return createMagicEmitter(overrides);
    case 'snow':
      return createSnowEmitter(overrides);
    case 'rain':
      return createRainEmitter(overrides);
    case 'dust':
      return createDustEmitter(overrides);
    default:
      return createSmokeEmitter(overrides);
  }
}

/**
 * 爆炸中心：一次性爆炸
 */
export function createExplosionEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 0,
    lifeMin: 0.4,
    lifeMax: 0.8,
    speedMin: 220,
    speedMax: 420,
    angleMin: 0,
    angleMax: Math.PI * 2,
    gravityY: 900,
    sizeMin: 6,
    sizeMax: 14,
    startAlpha: 1,
    endAlpha: 0,
    colorStart: [1, 0.9, 0.5],
    colorEnd: [1, 0.3, 0.0],
    spawnShape: 'circle',
    radiusX: 4,
    radiusY: 4,
    maxParticles: 500,
    blendMode: 'additive',   // 💥 发光
    ...overrides,
  });
}

/**
 * 火焰：小/大火焰
 */
export function createFireEmitter(params?: {
  small?: boolean;
  overrides?: Partial<ParticleEmitter2D>;
}): ParticleEmitter2D {
  const small = params?.small ?? true;
  const overrides = params?.overrides;

  const baseRate = small ? 80 : 200;
  const baseSizeMin = small ? 4 : 8;
  const baseSizeMax = small ? 10 : 18;

  return createParticleEmitter2D({
    emissionRate: baseRate,
    lifeMin: 0.5,
    lifeMax: 1.2,
    speedMin: 40,
    speedMax: 90,
    angleMin: -Math.PI / 2 - 0.5,
    angleMax: -Math.PI / 2 + 0.5,
    gravityY: -40,
    sizeMin: baseSizeMin,
    sizeMax: baseSizeMax,
    startAlpha: 0.9,
    endAlpha: 0.0,
    colorStart: [1, 0.7, 0.2],
    colorEnd: [0.6, 0.0, 0.0],
    spawnShape: 'circle',
    radiusX: small ? 6 : 16,
    radiusY: small ? 4 : 12,
    maxParticles: small ? 250 : 500,
    blendMode: 'additive',   // 🔥 发光火焰
    ...overrides,
  });
}

/**
 * 金属火花 / 子弹火花
 */
export function createSparkEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 0,
    lifeMin: 0.15,
    lifeMax: 0.35,
    speedMin: 350,
    speedMax: 650,
    angleMin: -Math.PI / 6,
    angleMax: Math.PI / 6,
    gravityY: 1400,
    sizeMin: 2,
    sizeMax: 4,
    startAlpha: 1.0,
    endAlpha: 0.0,
    colorStart: [1, 1, 0.8],
    colorEnd: [1, 0.8, 0.2],
    spawnShape: 'point',
    radiusX: 0,
    radiusY: 0,
    maxParticles: 300,
    blendMode: 'additive',   // ✨ 发光火花
    ...overrides,
  });
}

/**
 * 烟雾
 */
export function createSmokeEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 40,
    lifeMin: 1.0,
    lifeMax: 2.0,
    speedMin: 10,
    speedMax: 30,
    angleMin: -Math.PI / 2 - 0.4,
    angleMax: -Math.PI / 2 + 0.4,
    gravityY: -10,
    sizeMin: 12,
    sizeMax: 24,
    startAlpha: 0.6,
    endAlpha: 0.0,
    colorStart: [0.4, 0.4, 0.4],
    colorEnd: [0.2, 0.2, 0.2],
    spawnShape: 'circle',
    radiusX: 10,
    radiusY: 6,
    maxParticles: 200,
    // 默认 alpha 混合即可
    ...overrides,
  });
}

/**
 * 魔法光点
 */
export function createMagicEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 60,
    lifeMin: 0.8,
    lifeMax: 1.6,
    speedMin: 30,
    speedMax: 80,
    angleMin: 0,
    angleMax: Math.PI * 2,
    gravityY: 0,
    sizeMin: 3,
    sizeMax: 6,
    startAlpha: 1.0,
    endAlpha: 0.0,
    colorStart: [0.4, 0.8, 1.0],
    colorEnd: [0.8, 0.4, 1.0],
    spawnShape: 'circle',
    radiusX: 24,
    radiusY: 24,
    maxParticles: 300,
    blendMode: 'additive',   // 🪄 发光魔法
    ...overrides,
  });
}

/**
 * 下雪
 */
export function createSnowEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 80,
    lifeMin: 2.5,
    lifeMax: 4.5,
    speedMin: 20,
    speedMax: 40,
    angleMin: Math.PI / 2 - 0.2,
    angleMax: Math.PI / 2 + 0.2,
    gravityY: 40,
    sizeMin: 3,
    sizeMax: 6,
    startAlpha: 0.9,
    endAlpha: 0.0,
    colorStart: [0.9, 0.9, 1.0],
    colorEnd: [0.8, 0.8, 1.0],
    spawnShape: 'box',
    radiusX: 200,
    radiusY: 0,
    maxParticles: 400,
    ...overrides,
  });
}

/**
 * 下雨
 */
export function createRainEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 200,
    lifeMin: 1.0,
    lifeMax: 1.5,
    speedMin: 250,
    speedMax: 380,
    angleMin: Math.PI / 2 - 0.1,
    angleMax: Math.PI / 2 + 0.1,
    gravityY: 1200,
    sizeMin: 2,
    sizeMax: 3,
    startAlpha: 0.9,
    endAlpha: 0.0,
    colorStart: [0.6, 0.6, 1.0],
    colorEnd: [0.4, 0.4, 0.9],
    spawnShape: 'box',
    radiusX: 200,
    radiusY: 0,
    maxParticles: 600,
    ...overrides,
  });
}

/**
 * 跳跃尘埃 / 落地扬尘
 */
export function createDustEmitter(
  overrides?: Partial<ParticleEmitter2D>
): ParticleEmitter2D {
  return createParticleEmitter2D({
    emissionRate: 0,
    lifeMin: 0.4,
    lifeMax: 0.8,
    speedMin: 120,
    speedMax: 260,
    angleMin: Math.PI - Math.PI / 3,
    angleMax: 2 * Math.PI + Math.PI / 3,
    gravityY: 900,
    sizeMin: 4,
    sizeMax: 8,
    startAlpha: 0.8,
    endAlpha: 0.0,
    colorStart: [0.7, 0.6, 0.4],
    colorEnd: [0.4, 0.3, 0.2],
    spawnShape: 'point',
    radiusX: 0,
    radiusY: 0,
    maxParticles: 250,
    ...overrides,
  });
}
