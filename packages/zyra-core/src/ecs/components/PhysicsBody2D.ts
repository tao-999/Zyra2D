import { Component } from '../../core/Component';

export type BodyType2D = 'static' | 'dynamic' | 'kinematic';

/**
 * PhysicsBody2D：
 * - type: 刚体类型
 * - gravityScale: 重力倍率（配合 MotionSystem 的世界重力使用）
 * - bounciness: 垂直碰撞反弹系数（0 = 不弹，1 = 完全弹性）
 * - onGround: 本帧是否在地面上（由 PhysicsSystem2D 写入）
 */
export class PhysicsBody2D extends Component {
  type: BodyType2D = 'dynamic';

  /** 重力倍率：1 = 正常重力，0 = 不受重力影响 */
  gravityScale = 1;

  /**
   * 反弹系数：
   *  0   = 不反弹
   *  0.3 = 稍微有点弹
   *  0.8 = 很弹
   *  1   = 理论上完全弹性（基本不损失速度）
   */
  bounciness = 0;

  /** 是否锁定旋转（当前未实现旋转物理，预留字段） */
  fixedRotation = true;

  /** 本帧是否与地面接触，由 PhysicsSystem2D 更新 */
  onGround = false;
}
