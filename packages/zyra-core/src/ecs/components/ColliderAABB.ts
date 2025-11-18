import { Component } from '../../core/Component';
import type { Entity } from '../../core/Entity';

/**
 * ColliderAABB：轴对齐包围盒碰撞体（不做物理解算，只检测重叠）。
 *
 * - offsetX / offsetY: 相对 Transform 原点的偏移
 * - width / height: 碰撞盒尺寸
 * - isTrigger: 触发器（目前仅作标记，解算交由上层逻辑）
 * - contacts: 本帧重叠到的其它实体列表（每帧由碰撞系统刷新）
 */
export class ColliderAABB extends Component {
  offsetX = 0;
  offsetY = 0;
  width = 0;
  height = 0;
  isTrigger = false;

  contacts: Entity[] = [];
}
