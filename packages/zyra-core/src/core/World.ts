import { Entity } from './Entity';
import { System } from './System';

/**
 * World holds all entities and systems.
 */
export class World {
  readonly entities: Entity[] = [];
  readonly systems: System[] = [];

  createEntity(): Entity {
    const e = new Entity(this);
    this.entities.push(e);
    return e;
  }

  addSystem(system: System): void {
    (system as any).world = this;
    this.systems.push(system);
  }

  update(dt: number): void {
    for (const s of this.systems) {
      s.update(dt);
    }
  }
}
