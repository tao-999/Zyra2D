import { System } from '../../core/System';
import type { Entity } from '../../core/Entity';
import { Transform } from '../components/Transform';
import { ColliderAABB } from '../components/ColliderAABB';

/**
 * 非物理解算的 2D 碰撞系统：
 * - 每帧收集所有带 Transform + ColliderAABB 的实体
 * - 做 O(n^2) 碰撞检测
 * - 考虑 layer/mask 过滤
 * - 将重叠对写入各自的 collider.contacts
 */
export class CollisionSystem2D extends System {
  private colliders: {
    entity: Entity;
    t: Transform;
    c: ColliderAABB;
  }[] = [];

  update(dt: number): void {
    void dt;

    const list = this.colliders;
    list.length = 0;

    // 收集 collider，并清空上帧的 contacts
    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const c = e.getComponent(ColliderAABB);
      if (!t || !c || c.width <= 0 || c.height <= 0) continue;

      c.contacts.length = 0;
      list.push({ entity: e, t, c });
    }

    const n = list.length;
    if (n <= 1) return;

    // 双重循环做 AABB 检测
    for (let i = 0; i < n; i++) {
      const a = list[i];
      const ax1 = a.t.x + a.c.offsetX;
      const ay1 = a.t.y + a.c.offsetY;
      const ax2 = ax1 + a.c.width;
      const ay2 = ay1 + a.c.height;

      for (let j = i + 1; j < n; j++) {
        const b = list[j];
        const bx1 = b.t.x + b.c.offsetX;
        const by1 = b.t.y + b.c.offsetY;
        const bx2 = bx1 + b.c.width;
        const by2 = by1 + b.c.height;

        // layer/mask 过滤：双方都认为对方是“需要检测”的层
        const layerOk =
          (a.c.layer & b.c.mask) !== 0 &&
          (b.c.layer & a.c.mask) !== 0;

        if (!layerOk) continue;

        const overlap =
          ax1 < bx2 &&
          ax2 > bx1 &&
          ay1 < by2 &&
          ay2 > by1;

        if (!overlap) continue;

        a.c.contacts.push(b.entity);
        b.c.contacts.push(a.entity);
      }
    }
  }
}
