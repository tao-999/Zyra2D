// src/ecs/systems/TimelineSystem2D.ts

import type { System } from '../../core/System';
import type { World } from '../../core/World';

import { Transform } from '../components/Transform';
import {
  type Timeline2D,
  type TimelineTrack2D,
  type TimelineKeyframe2D,
  type TimelineEventMarker2D,
} from '../components/Timeline2D';

/**
 * TimelineSystem2D：
 * - 遍历所有有 Transform + Timeline2D 的实体
 * - 推进时间
 * - 根据关键帧插值并写回 Transform
 * - 处理时间轴事件（onEvent）
 */
export class TimelineSystem2D implements System {
  world!: World;

  /** 建议优先级在 Motion / Animation 之后，Collision / Render 之前 */
  priority = 25;

  update(dt: number): void {
    const world = this.world;
    const entities = world.entities;

    for (const e of entities) {
      const transform = e.getComponent(Transform);
      if (!transform) continue;

      // 类型系统帮不上忙，只能靠运行时
      const timeline = e.getComponent(
        (null as unknown) as new (...args: any[]) => Timeline2D
      ) as Timeline2D | undefined;

      if (!timeline || !timeline.playing) continue;

      // ===== 1) 推进时间 =====
      const speed = timeline.speed ?? 1;
      const prevTime = timeline.time;
      let currTime = prevTime + dt * speed;

      if (speed >= 0) {
        // 正向播放
        if (currTime > timeline.duration) {
          if (timeline.loop && timeline.duration > 0) {
            currTime = currTime % timeline.duration;
          } else {
            currTime = timeline.duration;
            timeline.playing = false;
          }
        }
      } else {
        // 反向播放（简单处理）
        if (currTime < 0) {
          if (timeline.loop && timeline.duration > 0) {
            const d = timeline.duration;
            currTime = ((currTime % d) + d) % d;
          } else {
            currTime = 0;
            timeline.playing = false;
          }
        }
      }

      timeline.prevTime = prevTime;
      timeline.time = currTime;

      // ===== 2) 处理事件（先于轨道应用或之后都行，这里先处理事件） =====
      this.processEvents(timeline, prevTime, currTime);

      // ===== 3) 应用各轨道 =====
      const t = timeline.time;
      for (const track of timeline.tracks) {
        this.applyTrack(track, transform, t);
      }
    }
  }

  private applyTrack(
    track: TimelineTrack2D,
    transform: Transform,
    time: number
  ): void {
    if (track.target !== 'transform') return;

    const value = sampleTrackValue(track, time);
    if (value === undefined) return;

    switch (track.property) {
      case 'x':
        transform.x = value;
        break;
      case 'y':
        transform.y = value;
        break;
      case 'rotation':
        (transform as any).rotation = value;
        break;
      case 'scaleX':
        (transform as any).scaleX = value;
        break;
      case 'scaleY':
        (transform as any).scaleY = value;
        break;
      default:
        break;
    }
  }

  /**
   * 处理 Timeline 上的事件：
   * - 看 prevTime → currTime 这段时间有没有跨过 event.time
   * - 循环 / 非循环 的处理稍有不同：
   *   - 非循环：触发一次后标记 fired=true，不再触发
   *   - 循环：每次跨过该时间点都会触发
   */
  private processEvents(
    timeline: Timeline2D,
    prevTime: number,
    currTime: number
  ): void {
    const events = timeline.events;
    if (!events || events.length === 0) return;

    const duration = timeline.duration;
    const loop = timeline.loop;
    const forward = timeline.speed >= 0;

    for (const ev of events) {
      if (!loop && ev.fired) continue;

      if (forward) {
        if (this.crossedForward(ev, prevTime, currTime, duration, loop)) {
          this.fireEvent(timeline, ev);
        }
      } else {
        if (this.crossedBackward(ev, prevTime, currTime, duration, loop)) {
          this.fireEvent(timeline, ev);
        }
      }
    }
  }

  private crossedForward(
    ev: TimelineEventMarker2D,
    prevTime: number,
    currTime: number,
    duration: number,
    loop: boolean
  ): boolean {
    const t = ev.time;

    if (!loop) {
      // 非循环：一次性 0 → duration
      return prevTime < t && currTime >= t;
    }

    if (duration <= 0) return false;

    if (currTime >= prevTime) {
      // 没有 wrap：直接在区间里
      return prevTime < t && currTime >= t;
    } else {
      // 有 wrap：prevTime → duration，再 → 0 → currTime
      return (prevTime < t && t <= duration) || (0 <= t && t <= currTime);
    }
  }

  private crossedBackward(
    ev: TimelineEventMarker2D,
    prevTime: number,
    currTime: number,
    duration: number,
    loop: boolean
  ): boolean {
    const t = ev.time;

    if (!loop) {
      // 非循环：从 duration → 0
      return prevTime > t && currTime <= t;
    }

    if (duration <= 0) return false;

    if (currTime <= prevTime) {
      // 没有 wrap：直接在区间里
      return prevTime > t && currTime <= t;
    } else {
      // 有 wrap：prevTime → 0，再 → duration → currTime
      return (0 <= t && t < prevTime) || (currTime <= t && t <= duration);
    }
  }

  private fireEvent(timeline: Timeline2D, ev: TimelineEventMarker2D): void {
    // 非循环：标记 fired，只触发一次
    if (!timeline.loop) {
      ev.fired = true;
    }

    if (timeline.onEvent) {
      timeline.onEvent(timeline, ev.name);
    }
  }
}

// ============ 工具函数 ============

function sampleTrackValue(
  track: TimelineTrack2D,
  time: number
): number | undefined {
  const keys = track.keys;
  if (!keys || keys.length === 0) return undefined;

  if (keys.length === 1) return keys[0].value;

  // time 在最前面
  if (time <= keys[0].time) return keys[0].value;

  // time 在最后面
  const last = keys[keys.length - 1];
  if (time >= last.time) return last.value;

  // 在中间，找到前后两个 key
  let k0: TimelineKeyframe2D = keys[0];
  let k1: TimelineKeyframe2D = keys[1];

  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (time >= a.time && time <= b.time) {
      k0 = a;
      k1 = b;
      break;
    }
  }

  const span = k1.time - k0.time;
  if (span <= 0) return k1.value;

  let t = (time - k0.time) / span; // 0 ~ 1
  t = applyEasing(t, k0.easing ?? k1.easing ?? 'linear');

  return k0.value * (1 - t) + k1.value * t;
}

/** 简单 easing 曲线 */
function applyEasing(t: number, easing: string): number {
  switch (easing) {
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'linear':
    default:
      return t;
  }
}
