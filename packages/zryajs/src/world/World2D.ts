// packages/zryajs/src/world/World2D.ts

import { Component } from "../component/Component";
import type { Renderer } from "../render/Renderer";

/**
 * Flame 的 World 对应：承载游戏世界的 Component 树。
 * 真正的渲染由 CameraComponent 控制。
 */
export class World2D {
  readonly root: Component;

  constructor() {
    this.root = new Component();
    this.root._attachWorld(this);
  }

  add(component: Component): void {
    this.root.add(component);
  }

  update(dt: number): void {
    this.root._updateTree(dt);
  }

  /** 仅供 CameraComponent 使用 */
  _render(renderer: Renderer): void {
    this.root._renderTree(renderer);
  }
}
