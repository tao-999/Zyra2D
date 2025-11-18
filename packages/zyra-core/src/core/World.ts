import { Entity } from './Entity';
import { System } from './System';

/**
 * World：持有所有实体和系统。
 */
export class World {
  readonly entities: Entity[] = [];
  readonly systems: System[] = [];

  /** 创建实体 */
  createEntity(): Entity {
    const e = new Entity(this);
    this.entities.push(e);
    return e;
  }

  /** 注册系统 */
  addSystem(system: System): void {
    (system as any).world = this;
    this.systems.push(system);
  }

  /** 标记实体为销毁（下一帧清理） */
  destroyEntity(entity: Entity): void {
    entity.destroy();
  }

  /** 每帧更新：先清理 dead entity，再跑所有系统 */
  update(dt: number): void {
    // 清理已经 destroy 的实体
    if (this.entities.length > 0) {
      let write = 0;
      for (let read = 0; read < this.entities.length; read++) {
        const e = this.entities[read];
        if (e.alive) {
          this.entities[write++] = e;
        } else {
          e._dispose();
        }
      }
      if (write !== this.entities.length) {
        this.entities.length = write;
      }
    }

    // 更新所有系统
    for (const s of this.systems) {
      s.update(dt);
    }
  }

  /** 清空整个世界 */
  clear(): void {
    for (const e of this.entities) {
      e._dispose();
    }
    this.entities.length = 0;
    this.systems.length = 0;
  }
}
