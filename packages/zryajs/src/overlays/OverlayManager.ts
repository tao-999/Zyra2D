// packages/zryajs/src/overlays/OverlayManager.ts

import type { OverlayId } from "./OverlayTypes";

/**
 * 小型 Overlay 管理器：
 * - 内部维护一个 Set<OverlayId>
 * - 支持订阅变化（给 UI 层用）
 */
export class OverlayManager {
  private readonly set = new Set<OverlayId>();
  private listeners: ((ids: ReadonlySet<OverlayId>) => void)[] = [];

  get ids(): ReadonlySet<OverlayId> {
    return this.set;
  }

  has(id: OverlayId): boolean {
    return this.set.has(id);
  }

  show(id: OverlayId): void {
    if (!this.set.has(id)) {
      this.set.add(id);
      this.notify();
    }
  }

  hide(id: OverlayId): void {
    if (this.set.delete(id)) {
      this.notify();
    }
  }

  clear(): void {
    if (this.set.size > 0) {
      this.set.clear();
      this.notify();
    }
  }

  subscribe(
    listener: (ids: ReadonlySet<OverlayId>) => void
  ): () => void {
    this.listeners.push(listener);
    // 立即推一次当前状态
    listener(this.set);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const snapshot = new Set(this.set);
    for (const l of this.listeners) {
      l(snapshot);
    }
  }
}
