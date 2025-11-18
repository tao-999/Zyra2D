import type { World } from './World';
import { Component } from './Component';

let NEXT_ENTITY_ID = 1;

/**
 * Represents a game entity: a collection of components.
 */
export class Entity {
  readonly id: number;
  readonly world: World;

  private components = new Map<Function, Component>();

  constructor(world: World) {
    this.world = world;
    this.id = NEXT_ENTITY_ID++;
  }

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

  getComponent<T extends Component>(Ctor: new (...args: any[]) => T): T | undefined {
    return this.components.get(Ctor) as T | undefined;
  }

  hasComponent<T extends Component>(Ctor: new (...args: any[]) => T): boolean {
    return this.components.has(Ctor);
  }
}
