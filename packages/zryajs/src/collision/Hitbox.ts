// packages/zryajs/src/collision/Hitbox.ts

import { PositionComponent } from "../component/PositionComponent";
import type { CollisionCallbacks } from "./CollisionCallbacks";

/**
 * 当前支持的碰撞形状：AABB。
 * 以后要扩 circle/polygon 可以在这里扩类型，不动系统主干。
 */
export type HitboxShapeType = "aabb";

export interface AABBShape {
  type: "aabb";
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export type HitboxShape = AABBShape;

/**
 * 碰撞层：用数字当 bit index。
 * 默认 layer = 0，mask = 0xffffffff（和所有层碰撞）。
 */
export type CollisionLayer = number;

let NEXT_HITBOX_ID = 1;

export interface HitboxOptions {
  /** 是否参与碰撞检测（默认 true） */
  enabled?: boolean;
  /** 是否为 trigger：只触发回调，不做物理处理（目前系统本身不做分离） */
  isTrigger?: boolean;
  /** 自身所在 layer（0..31），默认 0 */
  layer?: CollisionLayer;
  /**
   * 碰撞掩码：bit = 1 表示会和该 layer 的物体做检测。
   * 默认 0xffffffff：和所有 layer 碰撞。
   */
  mask?: number;
}

/**
 * Hitbox：
 * - 继承 PositionComponent：有 x/y/width/height/anchor
 * - 实现 CollisionCallbacks：可以直接挂碰撞回调
 * - 带 enabled / isTrigger / layer / mask，够用的最小核心
 */
export class Hitbox
  extends PositionComponent
  implements CollisionCallbacks
{
  /** 唯一 id，仅供内部系统使用 */
  readonly id: number;

  /** 碰撞形状（目前只有 AABB） */
  shape: HitboxShape;

  /** 是否参与碰撞检测 */
  enabled = true;

  /** 是否为 trigger（系统本身不做分离，只负责回调） */
  isTrigger = false;

  /** 自身所在 layer（0..31） */
  layer: CollisionLayer = 0;

  /** 碰撞掩码，bit 对应 layer */
  mask: number = 0xffffffff;

  // ==== 回调（来自 CollisionCallbacks） ====

  onCollisionStart?(other: CollisionCallbacks): void;
  onCollisionEnd?(other: CollisionCallbacks): void;

  constructor(shape: HitboxShape, options: HitboxOptions = {}) {
    super();
    this.id = NEXT_HITBOX_ID++;
    this.shape = shape;

    if (options.enabled !== undefined) this.enabled = options.enabled;
    if (options.isTrigger !== undefined) this.isTrigger = options.isTrigger;
    if (options.layer !== undefined) this.layer = options.layer;
    if (options.mask !== undefined) this.mask = options.mask;
  }
}
