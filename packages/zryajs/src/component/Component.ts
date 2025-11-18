// packages/zryajs/src/component/Component.ts

import type { Renderer } from "../render/Renderer";
import type { World2D } from "../world/World2D";

/**
 * 对应 Flame 的 Component：拥有父子关系、生命周期与 update/render。
 * 核心特性：
 * - 树结构：parent / children
 * - 生命周期：onLoad / onMount / onRemove
 * - 每帧：_updateTree / _renderTree 递归整棵子树
 * - 控制开关：active / visible
 */
export class Component {
  parent: Component | null = null;
  protected _children: Component[] = [];
  world: World2D | null = null;

  /**
   * 控制逻辑更新开关：
   * - active = false 时，本组件不会调用 update
   * - 但子组件仍然会照常更新（方便做“逻辑节点”暂停，而不影响 HUD 等）
   */
  active = true;

  /**
   * 控制渲染开关：
   * - visible = false 时，本组件不会 render
   * - 但子组件仍然会按自己的 visible 状态决定是否渲染
   */
  visible = true;

  get children(): readonly Component[] {
    return this._children;
  }

  // 生命周期钩子
  onLoad?(): void | Promise<void>;
  onMount?(): void;
  onRemove?(): void;

  update?(dt: number): void;
  render?(renderer: Renderer): void;

  /**
   * 添加子组件：
   * - 自动从旧 parent 脱离
   * - 继承当前 world（如果已经挂在某个 World 上）
   * - 调用 child.onLoad / child.onMount
   */
  add(child: Component): void {
    if (child === this) return;

    // 如果已经在别的父节点下，先移除
    if (child.parent && child.parent !== this) {
      child.parent.remove(child);
    }

    child.parent = this;
    this._children.push(child);

    // 如果当前已经挂在 world 上，则把 world 传递给整个子树
    if (this.world) {
      child._attachWorld(this.world);
    }

    child.onLoad?.();
    child.onMount?.();
  }

  /**
   * 从当前节点移除子组件。
   */
  remove(child: Component): void {
    const i = this._children.indexOf(child);
    if (i >= 0) {
      this._children.splice(i, 1);
      child.onRemove?.();
      child.parent = null;
      child.world = null;
    }
  }

  /**
   * 让当前组件从父节点上移除的便捷方法。
   */
  removeFromParent(): void {
    this.parent?.remove(this);
  }

  /** 供 World/Camera 内部调用：更新整棵树 */
  _updateTree(dt: number): void {
    if (this.active) {
      this.update?.(dt);
    }

    // 拍快照，避免遍历过程中 children 被增删导致问题
    const snapshot = this._children.slice();
    for (const c of snapshot) {
      c._updateTree(dt);
    }
  }

  /** 供 World/Camera 内部调用：渲染整棵树 */
  _renderTree(renderer: Renderer): void {
    if (this.visible) {
      this.render?.(renderer);
    }

    const snapshot = this._children.slice();
    for (const c of snapshot) {
      c._renderTree(renderer);
    }
  }

  /** 供 World2D 初始化 root / 或 add 时向下挂载 world 使用 */
  _attachWorld(world: World2D): void {
    this.world = world;
    const snapshot = this._children.slice();
    for (const c of snapshot) {
      c._attachWorld(world);
    }
  }
}
