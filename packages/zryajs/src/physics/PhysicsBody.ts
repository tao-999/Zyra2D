// packages/zryajs/src/physics/PhysicsBody.ts

import { PositionComponent } from "../component/PositionComponent";

/**
 * 刚体类型：
 * - static    : 静态，不移动，不受力（地面、墙）
 * - dynamic   : 动态，受力/重力影响（玩家、箱子）
 * - kinematic : 运动由外部代码直接设置 velocity（自动门、平台）
 */
export type BodyType = "static" | "dynamic" | "kinematic";

export interface PhysicsBodyOptions {
  bodyType?: BodyType;
  mass?: number;
  linearDamping?: number;
  gravityScale?: number;
  maxSpeed?: number;
}

/**
 * PhysicsBody：可继承的 2D 刚体基类。
 * - 继承 PositionComponent（x/y/width/height/...）
 * - 内置 velocity / force / mass / damping / gravityScale
 * - 由 PhysicsSystem 统一 update，不在 update(dt) 里自己积分
 *
 * 你可以直接继承它，实现自己的 onPhysicsStep(dt)。
 */
export class PhysicsBody extends PositionComponent {
  bodyType: BodyType = "dynamic";

  // 线速度（像素/秒）
  vx = 0;
  vy = 0;

  // 累积外力（牛顿：像素/秒² * mass）
  private forceX = 0;
  private forceY = 0;

  // 质量和其倒数
  private _mass = 1;
  private _invMass = 1;

  // 线性阻尼：类比空气阻力，0=无阻尼
  linearDamping = 0;

  // 重力缩放：1=正常重力，0=无重力
  gravityScale = 1;

  // 最大速度限制（像素/秒），Infinity 表示不限
  maxSpeed = Infinity;

  /**
   * 针对每个刚体的物理回调：
   * - 在 PhysicsSystem 里积分前调用
   * - 你可以在这里根据输入施加力/冲量，或者做自定义逻辑
   */
  onPhysicsStep?(dt: number): void;

  constructor(opts: PhysicsBodyOptions = {}) {
    super();

    if (opts.bodyType) this.bodyType = opts.bodyType;
    this.setMass(opts.mass ?? 1);
    if (opts.linearDamping !== undefined) this.linearDamping = opts.linearDamping;
    if (opts.gravityScale !== undefined) this.gravityScale = opts.gravityScale;
    if (opts.maxSpeed !== undefined) this.maxSpeed = opts.maxSpeed;
  }

  get mass(): number {
    return this._mass;
  }

  get invMass(): number {
    return this._invMass;
  }

  setMass(mass: number): void {
    const m = mass <= 0 ? 0 : mass;
    this._mass = m;
    this._invMass = m > 0 ? 1 / m : 0;
  }

  /** 施加持续力（会在每帧 PhysicsSystem.step 里被积分，然后被清空） */
  addForce(fx: number, fy: number): void {
    this.forceX += fx;
    this.forceY += fy;
  }

  /** 施加瞬时冲量：立刻改变速度 */
  addImpulse(ix: number, iy: number): void {
    if (this._invMass === 0) return;
    this.vx += ix * this._invMass;
    this.vy += iy * this._invMass;
  }

  /** 供 PhysicsSystem 使用：取出当前累积力并清空 */
  _consumeForces(): { fx: number; fy: number } {
    const fx = this.forceX;
    const fy = this.forceY;
    this.forceX = 0;
    this.forceY = 0;
    return { fx, fy };
  }
}
