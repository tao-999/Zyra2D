// packages/zryajs/src/game/GameLoop.ts

/**
 * 最小 GameLoop：只负责调 update/render。
 * 不依赖任何引擎内部结构。
 */
export class GameLoop {
  private running = false;
  private lastTime = 0;
  private rafId = 0;

  constructor(
    private readonly updateFn: (dt: number) => void,
    private readonly renderFn: () => void
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private loop = (time: number): void => {
    if (!this.running) return;

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.updateFn(dt);
    this.renderFn();

    this.rafId = requestAnimationFrame(this.loop);
  };
}
