// packages/zryajs/src/physics/PhysicsSystem.ts

import type { World2D } from "../world/World2D";
import type { Component } from "../component/Component";
import { PhysicsBody } from "./PhysicsBody";

/**
 * PhysicsSystem：
 * - 统一更新世界里所有 PhysicsBody
 * - 做“力 → 加速度 → 速度 → 位移”的积分（半隐式欧拉）
 * - 只负责运动学，不做碰撞分离（碰撞还是交给 CollisionSystem/游戏逻辑）
 */
export class PhysicsSystem {
  // 全局重力（像素/秒²），默认向下
  gravityX = 0;
  gravityY = 800;

  step(world: World2D, dt: number): void {
    const bodies: PhysicsBody[] = [];

    // 收集全部 PhysicsBody
    traverseComponents(world.root, (c) => {
      if (c instanceof PhysicsBody && c.active) {
        bodies.push(c);
      }
    });

    for (const body of bodies) {
      // 静态刚体不动
      if (body.bodyType === "static") {
        // 确保静态体速度为 0
        body.vx = 0;
        body.vy = 0;
        body._consumeForces();
        continue;
      }

      // 给刚体一个回调点：这里可以施加力/控制
      body.onPhysicsStep?.(dt);

      if (body.bodyType === "dynamic" && body.invMass > 0) {
        const { fx, fy } = body._consumeForces();

        // 加速度 = 力/mass + 重力
        const ax = fx * body.invMass + this.gravityX * body.gravityScale;
        const ay = fy * body.invMass + this.gravityY * body.gravityScale;

        // 积分速度
        body.vx += ax * dt;
        body.vy += ay * dt;

        // 线性阻尼
        if (body.linearDamping > 0) {
          const damping = Math.max(0, 1 - body.linearDamping * dt);
          body.vx *= damping;
          body.vy *= damping;
        }

        // 限速
        if (body.maxSpeed !== Infinity) {
          const v2 = body.vx * body.vx + body.vy * body.vy;
          const max2 = body.maxSpeed * body.maxSpeed;
          if (v2 > max2) {
            const s = body.maxSpeed / Math.sqrt(v2);
            body.vx *= s;
            body.vy *= s;
          }
        }
      } else if (body.bodyType === "kinematic") {
        // kinematic：跳过力和重力，只用当前 vx/vy 积分位置
        body._consumeForces(); // 清空可能被误加的力
      }

      // 位置积分（dynamic & kinematic 都要）
      body.x += body.vx * dt;
      body.y += body.vy * dt;
    }
  }
}

// ===== 工具：遍历组件树 =====

function traverseComponents(root: Component, fn: (c: Component) => void): void {
  fn(root);
  const children = root.children;
  for (let i = 0; i < children.length; i++) {
    traverseComponents(children[i] as Component, fn);
  }
}
