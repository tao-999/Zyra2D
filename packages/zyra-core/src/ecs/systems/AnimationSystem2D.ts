import { System } from '../../core/System';
import { Animator2D } from '../components/Animator2D';
import { Sprite } from '../components/Sprite';
import type { AssetManager } from '../../assets/AssetManager';

/**
 * AnimationSystem2D：
 * - 根据 dt 推进 Animator2D 的时间
 * - 选择当前帧
 * - 用 AssetManager 查找图片，并写回 Sprite.image
 *
 * 这里不做补间，只是离散帧切换。
 */
export class AnimationSystem2D extends System {
  constructor(private readonly assets: AssetManager) {
    super();
  }

  update(dt: number): void {
    if (dt <= 0) return;

    const entities = this.world.entities;

    for (const e of entities) {
      const animator = e.getComponent(Animator2D);
      const sprite = e.getComponent(Sprite);
      if (!animator || !sprite) continue;
      if (!animator.current || !animator.playing || animator.speed === 0) {
        continue;
      }

      const clip = animator.clips.find((c) => c.name === animator.current);
      if (!clip || clip.frames.length === 0) {
        continue;
      }

      // 推进时间
      animator.time += dt * animator.speed;

      // 计算当前所处帧
      const totalDuration = clip.frames.reduce(
        (sum, f) => sum + f.duration,
        0
      );
      let localTime = animator.time;

      if (clip.loop) {
        if (totalDuration > 0) {
          localTime = localTime % totalDuration;
        }
      } else {
        if (localTime >= totalDuration) {
          // 非循环：停在最后一帧，停止播放
          animator.time = totalDuration;
          animator.playing = false;
          localTime = totalDuration - 1e-6; // 避免刚好等于 totalDuration 导致选不到帧
        }
      }

      // 找到 localTime 对应的帧
      let acc = 0;
      let currentFrame = clip.frames[clip.frames.length - 1];
      for (const frame of clip.frames) {
        acc += frame.duration;
        if (localTime <= acc) {
          currentFrame = frame;
          break;
        }
      }

      // 根据 frame.key 获取图片
      const img = this.assets.getImage(currentFrame.key);
      if (!img) continue;

      // 写回 sprite
      sprite.image = img;
      sprite.textureName = currentFrame.key;
      sprite.width = img.width;
      sprite.height = img.height;
    }
  }
}
