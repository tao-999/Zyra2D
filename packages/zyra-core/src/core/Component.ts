import type { Entity } from './Entity';

/**
 * Base class for all components.
 * Components are pure data; logic should live in Systems.
 */
export abstract class Component {
  entity!: Entity;
}
