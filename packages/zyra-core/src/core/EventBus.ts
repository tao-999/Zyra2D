/**
 * 简单事件总线：
 * - on(event, handler)
 * - once(event, handler)
 * - off(event, handler?)
 * - emit(event, payload)
 */
export type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on<T = any>(event: string, handler: EventHandler<T>): void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EventHandler);
  }

  once<T = any>(event: string, handler: EventHandler<T>): void {
    const wrap: EventHandler<T> = (payload) => {
      this.off(event, wrap);
      handler(payload);
    };
    this.on(event, wrap);
  }

  off(event: string, handler?: EventHandler): void {
    const set = this.handlers.get(event);
    if (!set) return;
    if (!handler) {
      this.handlers.delete(event);
      return;
    }
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(event);
    }
  }

  emit<T = any>(event: string, payload: T): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const h of Array.from(set)) {
      try {
        (h as EventHandler<T>)(payload);
      } catch (err) {
        // 不在这里抛出，交给外层 Logger 处理会更好
        console.error('[Zyra2D EventBus] handler error', err);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
