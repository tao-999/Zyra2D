import type { World } from './World';

/**
 * Base class for all systems.
 * System contains logic, runs every frame.
 */
export abstract class System {
  world!: World;
  abstract update(dt: number): void;
}
