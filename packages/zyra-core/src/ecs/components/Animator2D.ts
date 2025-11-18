import { Component } from '../../core/Component';

/**
 * 单帧信息：
 * - key: AssetManager 中的图片 key
 * - duration: 本帧停留时间（秒）
 */
export interface AnimationFrame {
  key: string;
  duration: number;
}

/**
 * 动画片段：
 * - name: 片段名称（比如 "idle"、"run"）
 * - frames: 帧序列
 * - loop: 是否循环播放
 */
export interface AnimationClip {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

/**
 * Animator2D：
 * - 挂在实体上，用于控制 Sprite 的帧动画
 * - 不直接持有图片，只持有 AssetManager 的 key
 */
export class Animator2D extends Component {
  /** 所有动画片段 */
  clips: AnimationClip[] = [];

  /** 当前播放的片段名（null 表示不播放） */
  current: string | null = null;

  /** 当前片段内的时间游标（秒） */
  time = 0;

  /** 是否正在播放 */
  playing = true;

  /** 播放速度（1 = 原速，2 = 二倍速，0.5 = 半速） */
  speed = 1;

  /**
   * 切换到指定动画片段，并从头开始播放。
   * 如果指定名称不存在则保持当前状态。
   */
  play(name: string): void {
    if (this.current === name) {
      this.playing = true;
      return;
    }
    const exists = this.clips.some((c) => c.name === name);
    if (!exists) return;
    this.current = name;
    this.time = 0;
    this.playing = true;
  }

  /** 暂停播放 */
  pause(): void {
    this.playing = false;
  }

  /** 停止播放并回到片段开头 */
  stop(): void {
    this.playing = false;
    this.time = 0;
  }
}
