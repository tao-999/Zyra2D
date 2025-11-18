// packages/zryajs/src/collision/CollisionCallbacks.ts

/**
 * 碰撞回调接口。
 * 任何组件只要 implements 这个接口，就可以被碰撞系统回调。
 */
export interface CollisionCallbacks {
  /** 两个碰撞体刚开始相撞时触发（从“没有交集” → “有交集”） */
  onCollisionStart?(other: CollisionCallbacks): void;

  /** 两个碰撞体结束相撞时触发（从“有交集” → “没有交集”） */
  onCollisionEnd?(other: CollisionCallbacks): void;
}
