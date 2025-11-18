// packages/zryajs/src/game/ZryaGame.ts

import { GameLoop } from "./GameLoop";
import { World2D } from "../world/World2D";
import { CameraComponent } from "../world/CameraComponent";
import type { Renderer } from "../render/Renderer";
import { OverlayManager } from "../overlays/OverlayManager";
import { TimerManager } from "../timer/Timer";
import { CollisionSystem } from "../collision/CollisionSystem";
import { EffectManager } from "../effects/Effect";
import { PhysicsSystem } from "../physics/PhysicsSystem";

/**
 * 游戏根类，等价于 Flame 的 FlameGame。
 * - 持有 World2D + CameraComponent + Renderer + GameLoop
 * - 内部统一驱动：Timers / Physics / World / Camera / Collision / Effects
 * - 提供 onLoad / onUpdate / onRender 生命周期给游戏逻辑层使用
 * - 提供 overlays / overlayManager 供 UI 层使用
 */
export abstract class ZryaGame {
  readonly world: World2D;
  readonly camera: CameraComponent;
  readonly renderer: Renderer;
  readonly loop: GameLoop;

  /** 计时器管理器（通用 Timer 系统） */
  readonly timers = new TimerManager();

  /** 物理系统（刚体积分） */
  readonly physicsSystem = new PhysicsSystem();

  /** 碰撞系统（对世界中的 Hitbox 做检测） */
  readonly collisionSystem = new CollisionSystem();

  /** 屏幕/摄像机特效管理器 */
  readonly effects = new EffectManager();

  /** 原始 overlays 集合，兼容简单使用场景 */
  readonly overlays = new Set<string>();

  /** Overlay 管理器，支持订阅 */
  readonly overlayManager = new OverlayManager();

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.world = new World2D();
    this.camera = new CameraComponent();
    this.loop = new GameLoop(this.updateInternal, this.renderInternal);
  }

  /**
   * 初始化 / 资源加载入口。
   * 外部只需调用 start()，不需要手动调用 onLoad。
   */
  abstract onLoad(): Promise<void> | void;

  /**
   * 启动游戏循环：
   * - 先执行 onLoad（可以是 async）
   * - 再开始帧循环
   */
  async start(): Promise<void> {
    await this.onLoad();
    this.loop.start();
  }

  /**
   * 停止游戏循环。
   */
  stop(): void {
    this.loop.stop();
  }

  /**
   * 每帧更新逻辑钩子，子类可选重写。
   * dt 单位为秒。
   * 注意：在这之前已经完成：
   *   timers.update
   *   → physicsSystem.step
   *   → world.update
   *   → camera.update
   *   → collisionSystem.step
   *   → effects.update
   */
  protected onUpdate(dt: number): void {
    void dt;
  }

  /**
   * 每帧渲染后的用户自定义渲染钩子，子类可选重写。
   * 注意：在这之前已经完成：
   *   renderer.beginFrame
   *   → effects.beforeRender
   *   → camera.renderWorld(renderer, world)
   * 并且在 onRender 调用完后，会自动调用 effects.afterRender + renderer.endFrame。
   */
  protected onRender(): void {
    // 子类重写
  }

  /**
   * 显示 overlay。
   */
  showOverlay(id: string): void {
    this.overlays.add(id);
    this.overlayManager.show(id);
  }

  /**
   * 隐藏 overlay。
   */
  hideOverlay(id: string): void {
    this.overlays.delete(id);
    this.overlayManager.hide(id);
  }

  // ================= 内部：挂给 GameLoop 的回调 =================

  /**
   * 内部更新顺序：
   *   1) timers.update(dt)
   *   2) physicsSystem.step(world, dt)
   *   3) world.update(dt)
   *   4) camera.update(dt)
   *   5) collisionSystem.step(world)
   *   6) effects.update(dt)
   *   7) onUpdate(dt) 交给游戏逻辑
   */
  private updateInternal = (dt: number): void => {
    // 1. 计时器
    this.timers.update(dt);

    // 2. 物理（刚体积分）
    this.physicsSystem.step(this.world, dt);

    // 3. 世界逻辑（组件树）
    this.world.update(dt);

    // 4. 相机跟随等逻辑
    this.camera.update(dt);

    // 5. 碰撞检测
    this.collisionSystem.step(this.world);

    // 6. 特效状态更新
    this.effects.update(dt);

    // 7. 游戏自定义逻辑
    this.onUpdate(dt);
  };

  /**
   * 内部渲染顺序：
   *   1) renderer.beginFrame()
   *   2) effects.beforeRender(renderer)
   *   3) camera.renderWorld(renderer, world)
   *   4) onRender() 交给游戏逻辑（比如画 debug overlay）
   *   5) effects.afterRender(renderer)
   *   6) renderer.endFrame()
   */
  private renderInternal = (): void => {
    // 1. 开始一帧渲染
    this.renderer.beginFrame();

    // 2. 将要渲染世界前，先应用屏幕/摄像机级别的前置特效
    this.effects.beforeRender(this.renderer);

    // 3. 用相机渲染世界
    this.camera.renderWorld(this.renderer, this.world);

    // 4. 游戏层自定义渲染（例如 debug 文本、UI 等）
    this.onRender();

    // 5. 执行渲染后的特效（例如闪白、淡入淡出）
    this.effects.afterRender(this.renderer);

    // 6. 结束一帧渲染
    this.renderer.endFrame();
  };
}
