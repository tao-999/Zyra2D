// packages/zryajs/src/events/EventBus.ts

export type EventHandler<T> = (payload: T) => void;

/**
 * 类型安全的事件总线：
 *   type Events = { hit: { x: number, y: number }, died: { id: string } }
 *   const bus = new EventBus<Events>();
 */
export class EventBus<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<EventHandler<any>>>();

  on<K extends keyof Events>(
    type: K,
    handler: EventHandler<Events[K]>
  ): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(handler as any);
    return () => {
      set!.delete(handler as any);
    };
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const handler of set) {
      (handler as EventHandler<Events[K]>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
