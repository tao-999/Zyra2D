import { System } from '../../core/System';
import { Transform } from '../components/Transform';
import { Motion2D } from '../components/Motion2D';
import { PhysicsBody2D } from '../components/PhysicsBody2D';

/**
 * MotionSystem：
 * - 根据加速度/速度更新 Transform 位置
 * - 支持全局重力（只作用于 dynamic PhysicsBody2D）
 */
export class MotionSystem extends System {
  constructor(private gravityY: number = 0) {
    super();
  }

  update(dt: number): void {
    if (dt <= 0) return;

    const entities = this.world.entities;

    for (const e of entities) {
      const t = e.getComponent(Transform);
      const m = e.getComponent(Motion2D);
      if (!t || !m) continue;

      const body = e.getComponent(PhysicsBody2D);

      let ax = m.ax;
      let ay = m.ay;

      // 对动态刚体施加世界重力
      if (body && body.type === 'dynamic' && this.gravityY !== 0) {
        ay += this.gravityY * (body.gravityScale ?? 1);
      }

      // 加速度 -> 速度
      m.vx += ax * dt;
      m.vy += ay * dt;

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

      // 阻尼
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
