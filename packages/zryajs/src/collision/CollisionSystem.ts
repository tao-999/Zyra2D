// packages/zryajs/src/collision/CollisionSystem.ts

import type { World2D } from "../world/World2D";
import { Hitbox, HitboxShape, AABBShape } from "./Hitbox";
import type { CollisionCallbacks } from "./CollisionCallbacks";

/**
 * 简单碰撞系统：
 * - O(n^2) 检测所有 Hitbox 组件的 AABB 相交
 * - 支持 enabled、layer/mask 过滤
 * - 只做检测 & 回调，不做物理分离（由游戏逻辑或物理系统负责）
 */
export class CollisionSystem {
  /**
   * 记录上一帧中哪些 pair 在碰撞中，用于触发 onCollisionEnd。
   * key: "idA|idB"  (idA < idB)
   * value: [A的回调, B的回调]
   */
  private activePairs = new Map<string, [CollisionCallbacks, CollisionCallbacks]>();

  step(world: World2D): void {
    const hitboxes: Hitbox[] = [];

    // 收集世界里的所有 Hitbox
    traverseComponents(world.root, (comp) => {
      if (comp instanceof Hitbox && comp.enabled) {
        hitboxes.push(comp);
      }
    });

    // 新一帧的碰撞对
    const newPairs = new Map<string, [CollisionCallbacks, CollisionCallbacks]>();

    for (let i = 0; i < hitboxes.length; i++) {
      for (let j = i + 1; j < hitboxes.length; j++) {
        const a = hitboxes[i];
        const b = hitboxes[j];

        // layer/mask 检查：双向都要允许
        if (!shouldTestPair(a, b)) continue;

        if (!intersects(a.shape, a, b.shape, b)) continue;

        const key = pairKey(a, b);

        // 记录本帧存在的碰撞
        const pair: [CollisionCallbacks, CollisionCallbacks] = [a, b];
        newPairs.set(key, pair);

        // 如果上一帧没有这个 pair，则触发 onCollisionStart
        if (!this.activePairs.has(key)) {
          a.onCollisionStart?.(b);
          b.onCollisionStart?.(a);
        }
      }
    }

    // 找出已经结束的碰撞对：上一帧有，这一帧没有
    for (const [key, [ca, cb]] of this.activePairs) {
      if (!newPairs.has(key)) {
        ca.onCollisionEnd?.(cb);
        cb.onCollisionEnd?.(ca);
      }
    }

    // 替换 activePairs
    this.activePairs = newPairs;
  }
}

// ======= 工具函数 =======

import type { Component } from "../component/Component";

function traverseComponents(root: Component, fn: (c: Component) => void): void {
  fn(root);
  for (const child of root.children) {
    traverseComponents(child as Component, fn);
  }
}

/**
 * layer/mask 过滤：
 * - a.mask 的某一位为 1，表示 a 愿意和该 layer 的物体碰撞
 * - b.mask 同理
 * - 需要满足：a 想和 b 的 layer 撞 && b 想和 a 的 layer 撞
 */
function shouldTestPair(a: Hitbox, b: Hitbox): boolean {
  const bitA = 1 << a.layer;
  const bitB = 1 << b.layer;

  const aWantsB = (a.mask & bitB) !== 0;
  const bWantsA = (b.mask & bitA) !== 0;

  return aWantsB && bWantsA;
}

function pairKey(a: Hitbox, b: Hitbox): string {
  const idA = a.id;
  const idB = b.id;
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

function intersects(
  sa: HitboxShape,
  a: Hitbox,
  sb: HitboxShape,
  b: Hitbox
): boolean {
  // 当前只支持 AABB-AABB
  if (sa.type === "aabb" && sb.type === "aabb") {
    return aabbIntersects(sa as AABBShape, a, sb as AABBShape, b);
  }
  return false;
}

function aabbIntersects(
  sa: AABBShape,
  a: Hitbox,
  sb: AABBShape,
  b: Hitbox
): boolean {
  const ax1 = a.x + sa.offsetX;
  const ay1 = a.y + sa.offsetY;
  const ax2 = ax1 + sa.width;
  const ay2 = ay1 + sa.height;

  const bx1 = b.x + sb.offsetX;
  const by1 = b.y + sb.offsetY;
  const bx2 = bx1 + sb.width;
  const by2 = by1 + sb.height;

  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
}
