// src/ecs/systems/PhysicsSystem2D.ts

import { System } from '../../core/System';
import { PhysicsBody2D } from '../components/PhysicsBody2D';
import { Motion2D } from '../components/Motion2D';
import { Transform } from '../components/Transform';
import { ColliderAABB } from '../components/ColliderAABB';

/**
 * PhysicsSystem2D：
 * - 基于 CollisionSystem2D 写入的 contacts 做分离解算
 * - 只处理 dynamic 刚体 vs static/kinematic 的碰撞
 * - 解决穿透问题，并在垂直方向碰撞时设置 onGround / 做弹力
 *
 * 要求：
 * - 在 Engine 中：顺序为
 *   MotionSystem -> CollisionSystem2D -> PhysicsSystem2D -> 渲染
 */
export class PhysicsSystem2D extends System {
  update(dt: number): void {
    void dt;

    const entities = this.world.entities;

    // 每帧先重置所有 body 的 onGround 状态
    for (const e of entities) {
      const body = e.getComponent(PhysicsBody2D);
      if (body) {
        body.onGround = false;
      }
    }

    // 对每个 dynamic 刚体做分离解算
    for (const e of entities) {
      const body = e.getComponent(PhysicsBody2D);
      const motion = e.getComponent(Motion2D);
      const t = e.getComponent(Transform);
      const collider = e.getComponent(ColliderAABB);
      if (!body || !motion || !t || !collider) continue;
      if (body.type !== 'dynamic') continue;

      const contacts = collider.contacts;
      if (!contacts || contacts.length === 0) continue;

      for (const other of contacts) {
        const otherBody = other.getComponent(PhysicsBody2D);
        const otherT = other.getComponent(Transform);
        const otherC = other.getComponent(ColliderAABB);
        if (!otherT || !otherC) continue;

        // 只和非 dynamic 刚体解算（static / kinematic / 无 PhysicsBody 的视为 static）
        const otherType = otherBody?.type ?? 'static';
        if (otherType === 'dynamic') continue;

        // 重新计算当前帧的 AABB（已经是运动后的位置）
        const ax1 = t.x + collider.offsetX;
        const ay1 = t.y + collider.offsetY;
        const ax2 = ax1 + collider.width;
        const ay2 = ay1 + collider.height;

        const bx1 = otherT.x + otherC.offsetX;
        const by1 = otherT.y + otherC.offsetY;
        const bx2 = bx1 + otherC.width;
        const by2 = by1 + otherC.height;

        // 再次确认确实重叠
        const overlapX1 = ax2 - bx1;
        const overlapX2 = bx2 - ax1;
        const overlapY1 = ay2 - by1;
        const overlapY2 = by2 - ay1;

        if (overlapX1 <= 0 || overlapX2 <= 0 || overlapY1 <= 0 || overlapY2 <= 0) {
          continue;
        }

        // 计算沿 X / Y 的分离向量
        let sepX: number;
        if (overlapX1 < overlapX2) {
          sepX = -overlapX1; // 向左推
        } else {
          sepX = overlapX2; // 向右推
        }

        let sepY: number;
        if (overlapY1 < overlapY2) {
          sepY = -overlapY1; // 向上推
        } else {
          sepY = overlapY2; // 向下推
        }

        // 选择绝对值更小的轴作为分离方向（最小平移向量）
        if (Math.abs(sepX) < Math.abs(sepY)) {
          // 水平方向分离
          t.x += sepX;

          if (sepX > 0 && motion.vx < 0) motion.vx = 0;
          if (sepX < 0 && motion.vx > 0) motion.vx = 0;
        } else {
          // 垂直方向分离
          t.y += sepY;

          // ===== 使用 bounciness 做弹力 =====
          const eBounce = clamp01(body.bounciness);
          const epsilonStop = 20; // 速度阈值，小于此就当停下，避免无限抖动

          if (sepY < 0) {
            // 被向上推：说明踩在“地面”上（我们的坐标是 y 向下）
            if (motion.vy > 0) {
              if (eBounce > 0) {
                const bouncedVy = -motion.vy * eBounce;
                if (Math.abs(bouncedVy) < epsilonStop) {
                  motion.vy = 0;
                } else {
                  motion.vy = bouncedVy;
                }
              } else {
                motion.vy = 0;
              }
            }
          } else if (sepY > 0) {
            // 被向下推：撞到“天花板”
            if (motion.vy < 0) {
              if (eBounce > 0) {
                const bouncedVy = -motion.vy * eBounce;
                if (Math.abs(bouncedVy) < epsilonStop) {
                  motion.vy = 0;
                } else {
                  motion.vy = bouncedVy;
                }
              } else {
                motion.vy = 0;
              }
            }
          }

          // ===== onGround 判定：只在“踩地面且不再明显弹跳”时为 true =====
          const bodyBottomAfter = t.y + collider.offsetY + collider.height;
          const otherTop = by1;
          const epsilon = 0.5;

          if (
            sepY < 0 &&                                // 被向上推（站在上面）
            bodyBottomAfter <= otherTop + epsilon &&   // 底边贴合对方顶部
            motion.vy >= 0 &&                          // 当前没有向上的速度
            eBounce <= 0.01                            // 不怎么弹的物体才算真正 onGround
          ) {
            body.onGround = true;
          }
        }
      }
    }
  }
}

// 简单 0~1 clamp
function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
