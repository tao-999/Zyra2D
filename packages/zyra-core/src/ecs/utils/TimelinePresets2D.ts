// src/ecs/utils/TimelinePresets2D.ts

import {
  createTimeline2D,
  type Timeline2D,
  type TimelineEasing,
} from '../components/Timeline2D';

/**
 * 常见粒子类型枚举（呃这里不是粒子，是 Timeline 预设类型，可以按需扩展）：
 *
 * 这里我们主要提供一些常见的 Transform 动画：
 * - 左右晃动
 * - 上下浮动
 * - 呼吸缩放
 * - 旋转循环
 * - PopIn 进场
 */

/**
 * 来回平移（PingPong）：
 * 例如：灯牌左右晃动、UI 按钮左右轻微移动
 *
 * - fromX → toX → fromX
 */
export function createPingPongMoveXTimeline(options: {
  fromX: number;
  toX: number;
  duration?: number;   // 单程时长，默认 0.5s
  easing?: TimelineEasing;
  loop?: boolean;      // 默认 true
}): Timeline2D {
  const {
    fromX,
    toX,
    duration = 0.5,
    easing = 'easeInOut',
    loop = true,
  } = options;

  return createTimeline2D({
    loop,
    duration: duration * 2,
    tracks: [
      {
        target: 'transform',
        property: 'x',
        keys: [
          { time: 0, value: fromX, easing },
          { time: duration, value: toX, easing },
          { time: duration * 2, value: fromX, easing },
        ],
      },
    ],
  });
}

/**
 * 上下浮动（Idle 呼吸感）：
 * 常用于角色待机 / 魔法光球贴在身上飘
 */
export function createFloatYTimeline(options: {
  baseY: number;
  amplitude?: number;  // 振幅，默认 6 像素
  period?: number;     // 完整周期时长，默认 1.2 秒
  easing?: TimelineEasing;
  loop?: boolean;
}): Timeline2D {
  const {
    baseY,
    amplitude = 6,
    period = 1.2,
    easing = 'easeInOut',
    loop = true,
  } = options;

  const half = period / 2;

  return createTimeline2D({
    loop,
    duration: period,
    tracks: [
      {
        target: 'transform',
        property: 'y',
        keys: [
          { time: 0, value: baseY, easing },
          { time: half, value: baseY - amplitude, easing },
          { time: period, value: baseY, easing },
        ],
      },
    ],
  });
}

/**
 * 缩放呼吸效果（UI 按钮 / 拾取物品闪烁）
 */
export function createScalePulseTimeline(options: {
  baseScale?: number;      // 默认 1
  pulseScale?: number;     // 默认 1.15
  duration?: number;       // 完整往返时间，默认 0.6s
  easing?: TimelineEasing;
  loop?: boolean;
}): Timeline2D {
  const {
    baseScale = 1,
    pulseScale = 1.15,
    duration = 0.6,
    easing = 'easeInOut',
    loop = true,
  } = options;

  const half = duration / 2;

  return createTimeline2D({
    loop,
    duration,
    tracks: [
      {
        target: 'transform',
        property: 'scaleX',
        keys: [
          { time: 0, value: baseScale, easing },
          { time: half, value: pulseScale, easing },
          { time: duration, value: baseScale, easing },
        ],
      },
      {
        target: 'transform',
        property: 'scaleY',
        keys: [
          { time: 0, value: baseScale, easing },
          { time: half, value: pulseScale, easing },
          { time: duration, value: baseScale, easing },
        ],
      },
    ],
  });
}

/**
 * 简单旋转循环（比如旋转的金币 / 齿轮）
 */
export function createRotateLoopTimeline(options: {
  speed?: number;  // 每秒多少弧度，默认 2π = 一秒转一圈
  duration?: number; // 默认 1 秒
  loop?: boolean;
}): Timeline2D {
  const {
    speed = Math.PI * 2,
    duration = 1,
    loop = true,
  } = options;

  return createTimeline2D({
    loop,
    duration,
    tracks: [
      {
        target: 'transform',
        property: 'rotation',
        keys: [
          { time: 0, value: 0, easing: 'linear' },
          { time: duration, value: speed * duration, easing: 'linear' },
        ],
      },
    ],
  });
}

/**
 * 进场：从小到大 + 位移（UI 弹出 / 物品掉落）
 */
export function createPopInTimeline(options: {
  fromY: number;
  toY: number;
  duration?: number;       // 默认 0.35 秒
  overshootScale?: number; // 峰值 scale，默认 1.2
}): Timeline2D {
  const {
    fromY,
    toY,
    duration = 0.35,
    overshootScale = 1.2,
  } = options;

  const t1 = duration * 0.35;
  const t2 = duration;

  return createTimeline2D({
    loop: false,
    duration,
    tracks: [
      // Y 位移：从 fromY 掉到 toY
      {
        target: 'transform',
        property: 'y',
        keys: [
          { time: 0, value: fromY, easing: 'easeOut' },
          { time: duration, value: toY, easing: 'easeOut' },
        ],
      },
      // scaleX / scaleY：先超一点，再回落到 1
      {
        target: 'transform',
        property: 'scaleX',
        keys: [
          { time: 0, value: 0.0, easing: 'easeOut' },
          { time: t1, value: overshootScale, easing: 'easeOut' },
          { time: t2, value: 1.0, easing: 'easeInOut' },
        ],
      },
      {
        target: 'transform',
        property: 'scaleY',
        keys: [
          { time: 0, value: 0.0, easing: 'easeOut' },
          { time: t1, value: overshootScale, easing: 'easeOut' },
          { time: t2, value: 1.0, easing: 'easeInOut' },
        ],
      },
    ],
  });
}
