import { World } from './World';
import type { Renderer } from '../render/Renderer';
import { Canvas2DRenderer } from '../render/Canvas2DRenderer';
import { RenderSystem } from '../ecs/systems/RenderSystem';
import { MotionSystem } from '../ecs/systems/MotionSystem';
import { CollisionSystem2D } from '../ecs/systems/CollisionSystem2D';
import { AssetManager } from '../assets/AssetManager';
import { Input } from '../input/Input';
import { Camera2D } from '../render/Camera2D';
import { Time } from './Time';

/**
 * 引擎初始化选项。
 */
export interface EngineOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundColor?: string;
}

/**
 * Engine：协调 world / renderer / camera / assets / input / time 和主循环。
 */
export class Engine {
  readonly world: World;
  readonly renderer: Renderer;
  readonly assets: AssetManager;
  readonly input: Input;
  readonly camera: Camera2D;
  readonly time: Time;

  private running = false;
  private lastTime = 0;
  private rafId = 0;

  constructor(options: EngineOptions) {
    const { canvas, width, height, backgroundColor = '#000000' } = options;

    canvas.width = width;
    canvas.height = height;

    this.renderer = new Canvas2DRenderer(canvas, backgroundColor);
    this.world = new World();
    this.assets = new AssetManager();
    this.input = new Input(canvas);
    this.camera = new Camera2D(width, height);
    this.time = new Time();

    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1;

    // System 顺序很重要：
    // 1. 运动
    this.world.addSystem(new MotionSystem());
    // 2. 碰撞检测
    this.world.addSystem(new CollisionSystem2D());
    // 3. 渲染（用更新后的坐标）
    this.world.addSystem(new RenderSystem(this.renderer, this.camera));
  }

  /** 启动主循环 */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  /** 停止主循环（不会销毁资源） */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  /** 完整销毁：停止循环 + 清理世界和事件监听 */
  destroy(): void {
    this.stop();
    this.world.clear();
    this.assets.clear();
    this.input.dispose();
  }

  private loop = (time: number): void => {
    if (!this.running) return;

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // 更新 Time
    this.time.delta = dt;
    this.time.elapsed += dt;
    this.time.frame++;

    // 本帧开始：重置 input 的 pressed/released 状态
    this.input.beginFrame();

    // 更新 ECS 世界（内部会依次跑 Motion -> Collision -> Render）
    this.world.update(dt);

    this.rafId = requestAnimationFrame(this.loop);
  };
}
