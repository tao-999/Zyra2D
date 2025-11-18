import type { Entity } from './Entity';

/**
 * Base class for all components.
 * Components持有数据，逻辑放在 System 里。
 */
export abstract class Component {
  entity!: Entity;
}
