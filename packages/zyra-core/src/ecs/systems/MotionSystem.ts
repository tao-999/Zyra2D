import { System } from '../../core/System';
import { Transform } from '../components/Transform';
import { Motion2D } from '../components/Motion2D';

/**
 * MotionSystem：根据 Motion2D 更新 Transform 位置。
 *
 * - 先用加速度更新速度
 * - 做最大速度限制
 * - 应用阻尼
 * - 再更新位置
 */
export class MotionSystem extends System {
  update(dt: number): void {
    if (dt <= 0) return;

    const entities = this.world.entities;

    for (const e of entities) {
      const t = e.getComponent(Transform);
      const m = e.getComponent(Motion2D);
      if (!t || !m) continue;

      // 加速度 -> 速度
      m.vx += m.ax * dt;
      m.vy += m.ay * dt;

      // 最大速度限制
      if (m.maxSpeed > 0) {
        const speedSq = m.vx * m.vx + m.vy * m.vy;
        const maxSq = m.maxSpeed * m.maxSpeed;
        if (speedSq > maxSq) {
          const k = m.maxSpeed / Math.sqrt(speedSq);
          m.vx *= k;
          m.vy *= k;
        }
      }

      // 阻尼（简单指数衰减）
      if (m.damping > 0) {
        const factor = Math.max(0, 1 - m.damping * dt);
        m.vx *= factor;
        m.vy *= factor;
      }

      // 速度 -> 位置
      t.x += m.vx * dt;
      t.y += m.vy * dt;
    }
  }
}
