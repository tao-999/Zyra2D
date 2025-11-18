import type { World } from './World';
import { Component } from './Component';

let NEXT_ENTITY_ID = 1;

/**
 * Entity：一组组件的容器。
 */
export class Entity {
  readonly id: number;
  readonly world: World;

  private components = new Map<Function, Component>();
  private _alive = true;

  constructor(world: World) {
    this.world = world;
    this.id = NEXT_ENTITY_ID++;
  }

  get alive(): boolean {
    return this._alive;
  }

  /** 添加组件 */
  addComponent<T extends Component>(
    Ctor: new (...args: any[]) => T,
    props?: Partial<T>
  ): T {
    const comp = new Ctor();
    Object.assign(comp, props);
    (comp as any).entity = this;
    this.components.set(Ctor, comp);
    return comp;
  }

  /** 获取组件 */
  getComponent<T extends Component>(Ctor: new (...args: any[]) => T): T | undefined {
    return this.components.get(Ctor) as T | undefined;
  }

  /** 是否拥有组件 */
  hasComponent<T extends Component>(Ctor: new (...args: any[]) => T): boolean {
    return this.components.has(Ctor);
  }

  /** 移除组件 */
  removeComponent<T extends Component>(Ctor: new (...args: any[]) => T): void {
    this.components.delete(Ctor);
  }

  /** 标记实体为销毁，World 在下一帧清理 */
  destroy(): void {
    this._alive = false;
  }

  /** 由 World 调用，做最终清理 */
  _dispose(): void {
    this.components.clear();
  }
}
