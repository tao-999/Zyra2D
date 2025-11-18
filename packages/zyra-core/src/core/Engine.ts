import { World } from './World';
import type { Renderer } from '../render/Renderer';
import { Canvas2DRenderer } from '../render/Canvas2DRenderer';
import { RenderSystem } from '../ecs/systems/RenderSystem';
import { MotionSystem } from '../ecs/systems/MotionSystem';
import { CollisionSystem2D } from '../ecs/systems/CollisionSystem2D';
import { TextRenderSystem } from '../ecs/systems/TextRenderSystem';
import { DebugDrawSystem } from '../ecs/systems/DebugDrawSystem';
import { AssetManager } from '../assets/AssetManager';
import { Input } from '../input/Input';
import { Camera2D } from '../render/Camera2D';
import { Time } from './Time';
import { EventBus } from './EventBus';
import { ConsoleLogger, Logger } from './Logger';

/**
 * 引擎初始化选项。
 */
export interface EngineOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundColor?: string;

  /** 可选自定义 Logger */
  logger?: Logger;

  /** 是否绘制碰撞体调试框 */
  debugDrawColliders?: boolean;
}

/**
 * Engine：协调 world / renderer / camera / assets / input / time / events 和主循环。
 */
export class Engine {
  readonly world: World;
  readonly renderer: Renderer;
  readonly assets: AssetManager;
  readonly input: Input;
  readonly camera: Camera2D;
  readonly time: Time;
  readonly events: EventBus;
  readonly logger: Logger;

  private running = false;
  private lastTime = 0;
  private rafId = 0;

  private _width: number;
  private _height: number;

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  constructor(options: EngineOptions) {
    const {
      canvas,
      width,
      height,
      backgroundColor = '#000000',
      logger,
      debugDrawColliders = false,
    } = options;

    this._width = width;
    this._height = height;

    canvas.width = width;
    canvas.height = height;

    this.logger = logger ?? new ConsoleLogger();
    this.events = new EventBus();

    this.renderer = new Canvas2DRenderer(canvas, backgroundColor);
    this.renderer.setClearColor(backgroundColor);
    this.renderer.resize(width, height);

    this.world = new World();
    this.assets = new AssetManager();
    this.input = new Input(canvas);
    this.camera = new Camera2D(width, height);
    this.time = new Time();

    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1;

    // System 顺序：
    // 1. 运动
    this.world.addSystem(new MotionSystem());
    // 2. 碰撞检测
    this.world.addSystem(new CollisionSystem2D());
    // 3. 精灵渲染
    this.world.addSystem(new RenderSystem(this.renderer, this.camera));
    // 4. 文本渲染（叠在精灵之上）
    this.world.addSystem(new TextRenderSystem(this.renderer, this.camera));
    // 5. Debug 碰撞框（可选）
    if (debugDrawColliders) {
      this.world.addSystem(new DebugDrawSystem(this.renderer, this.camera));
    }

    this.logger.info('Engine initialized');
  }

  /** 启动主循环 */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
    this.logger.info('Engine started');
  }

  /** 停止主循环（不会销毁资源） */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.logger.info('Engine stopped');
  }

  /** 完整销毁：停止循环 + 清理世界和事件监听 */
  destroy(): void {
    this.stop();
    this.world.clear();
    this.assets.clear();
    this.input.dispose();
    this.events.clear();
    this.logger.info('Engine destroyed');
  }

  /**
   * 视口尺寸变化时调用：
   * - 更新 canvas
   * - 更新 renderer
   * - 更新 camera 的 viewport
   */
  resize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    this.renderer.resize(width, height);
    this.camera.viewportWidth = width;
    this.camera.viewportHeight = height;

    this.logger.info('Engine resized', width, height);
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

    try {
      // 更新 ECS 世界
      this.world.update(dt);
    } catch (err) {
      this.logger.error('Error during world.update()', err);
      this.events.emit('engine:error', err);
      throw err;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}
