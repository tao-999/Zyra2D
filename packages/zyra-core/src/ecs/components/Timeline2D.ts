// src/ecs/components/Timeline2D.ts

import type { Component } from '../../core/Component';
import type { Entity } from '../../core/Entity';

/**
 * 目前我们先做 Transform 级别的关键帧：
 * - x / y / rotation / scaleX / scaleY
 */
export type TimelineProperty2D =
  | 'x'
  | 'y'
  | 'rotation'
  | 'scaleX'
  | 'scaleY';

export type TimelineTarget2D = 'transform';

/** 插值方式（先实现 linear，其他先预留） */
export type TimelineEasing =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut';

export interface TimelineKeyframe2D {
  time: number;   // 秒
  value: number;
  easing?: TimelineEasing;
}

export interface TimelineTrack2D {
  target: TimelineTarget2D;   // 目前只有 'transform'
  property: TimelineProperty2D;
  keys: TimelineKeyframe2D[];
}

/**
 * 时间轴上的事件标记：
 * - 比如 0.3s 播放音效
 * - 0.8s 触发粒子爆炸
 */
export interface TimelineEventMarker2D {
  time: number;
  name: string;
  /** 非循环 Timeline 下：只会触发一次，触发后标记为 true */
  fired?: boolean;
}

/**
 * Timeline2D 组件：
 * - 挂在任意有 Transform 的实体上
 * - 决定这个实体的 Transform 如何随时间变化
 * - 可以在特定时间点触发事件
 */
export interface Timeline2D extends Component {
  /** 当前是否在播放 */
  playing: boolean;

  /** 是否循环 */
  loop: boolean;

  /** 当前时间（秒） */
  time: number;

  /** 上一帧的时间（秒），用于事件触发判断 */
  prevTime: number;

  /** 总时长（秒） */
  duration: number;

  /** 播放速度（1 = 正常，2 = 两倍，-1 = 反向） */
  speed: number;

  /** 关键帧轨道 */
  tracks: TimelineTrack2D[];

  /** 事件标记列表（可选） */
  events?: TimelineEventMarker2D[];

  /**
   * 事件回调：
   * - 当时间从 prevTime → time 跨过某个事件的 time 时调用
   * - name 即事件名
   */
  onEvent?: (timeline: Timeline2D, name: string) => void;

  entity: Entity;
}

/**
 * 创建一个空的 Timeline2D，可以自己填 tracks / events。
 */
export function createTimeline2D(
  partial?: Partial<Timeline2D>
): Timeline2D {
  const base: Timeline2D = {
    playing: false,
    loop: false,
    time: 0,
    prevTime: 0,
    duration: 1,
    speed: 1,
    tracks: [],
    events: undefined,
    onEvent: undefined,
    // entity 会由 ECS 注入，这里占位
    entity: (null as unknown) as Entity,
  };

  const t = Object.assign(base, partial ?? {}) as Timeline2D;

  // 如果没有显式 duration，尝试根据 keyframes 推导最大 time
  if ((partial?.duration === undefined) && t.tracks.length > 0) {
    let maxTime = 0;
    for (const track of t.tracks) {
      for (const k of track.keys) {
        if (k.time > maxTime) maxTime = k.time;
      }
    }
    if (maxTime > 0) {
      t.duration = maxTime;
    }
  }

  return t;
}

/** 播放（可选重头开始） */
export function playTimeline(
  tl: Timeline2D,
  restart: boolean = false
): void {
  if (restart) {
    tl.time = 0;
    tl.prevTime = 0;
    // 非循环 Timeline 的事件重置 fired 状态
    if (!tl.loop && tl.events) {
      for (const ev of tl.events) {
        ev.fired = false;
      }
    }
  }
  tl.playing = true;
}

/** 暂停 */
export function pauseTimeline(tl: Timeline2D): void {
  tl.playing = false;
}

/** 停止并回到 0 */
export function stopTimeline(tl: Timeline2D): void {
  tl.playing = false;
  tl.time = 0;
  tl.prevTime = 0;
  // 非循环 Timeline，顺手把事件重置
  if (!tl.loop && tl.events) {
    for (const ev of tl.events) {
      ev.fired = false;
    }
  }
}

/** 往 Timeline 里加一个事件标记 */
export function addTimelineEvent(
  tl: Timeline2D,
  time: number,
  name: string
): void {
  if (!tl.events) {
    tl.events = [];
  }
  tl.events.push({ time, name, fired: false });

  // 若 time 超过当前 duration，顺便拉长 duration
  if (time > tl.duration) {
    tl.duration = time;
  }
}

/** 清除所有事件标记 */
export function clearTimelineEvents(tl: Timeline2D): void {
  tl.events = [];
}
