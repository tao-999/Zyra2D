// packages/zryajs/src/timer/Timer.ts

export type TimerCallback = () => void;

/**
 * 简单计时器：支持一次性 / 循环。
 */
export class Timer {
  elapsed = 0;
  active = true;

  constructor(
    public duration: number,
    public repeat: boolean = false,
    private readonly cb?: TimerCallback
  ) {}

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;
    while (this.elapsed >= this.duration && this.active) {
      this.cb?.();
      if (this.repeat) {
        this.elapsed -= this.duration;
      } else {
        this.active = false;
      }
    }
  }

  reset(): void {
    this.elapsed = 0;
    this.active = true;
  }

  stop(): void {
    this.active = false;
  }
}

/**
 * 计时器管理器：挂在 Game 或 World 上，统一 update(dt)。
 */
export class TimerManager {
  private timers = new Set<Timer>();

  add(timer: Timer): Timer {
    this.timers.add(timer);
    return timer;
  }

  remove(timer: Timer): void {
    this.timers.delete(timer);
  }

  update(dt: number): void {
    for (const t of this.timers) {
      t.update(dt);
    }
  }

  clear(): void {
    this.timers.clear();
  }
}
