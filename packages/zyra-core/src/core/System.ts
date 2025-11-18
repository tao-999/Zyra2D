import type { World } from './World';

/**
 * System：每帧执行的逻辑单元。
 */
export abstract class System {
  world!: World;
  abstract update(dt: number): void;
}
