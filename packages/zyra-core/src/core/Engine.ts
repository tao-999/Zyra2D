import { World } from './World';
import type { Renderer } from '../render/Renderer';
import { Canvas2DRenderer } from '../render/Canvas2DRenderer';
import { RenderSystem } from '../ecs/systems/RenderSystem';

/**
 * Engine options used to bootstrap a Zyra2D game instance.
 */
export interface EngineOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

/**
 * Engine: coordinates world, renderer and main loop.
 */
export class Engine {
  readonly world: World;
  readonly renderer: Renderer;

  private running = false;
  private lastTime = 0;

  constructor(options: EngineOptions) {
    const { canvas, width, height, backgroundColor = '#000000' } = options;

    canvas.width = width;
    canvas.height = height;

    this.renderer = new Canvas2DRenderer(canvas, backgroundColor);
    this.world = new World();

    // Attach core systems
    this.world.addSystem(new RenderSystem(this.renderer));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
  }

  private loop = (time: number): void => {
    if (!this.running) return;

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.world.update(dt);

    requestAnimationFrame(this.loop);
  };
}
