// packages/zryajs/src/debug/DebugOverlay.ts

import type { World2D } from "../world/World2D";
import { TextComponent } from "../component/TextComponent";
import type { Component } from "../component/Component";

export interface DebugOverlayOptions {
  /** 文本起始位置（世界坐标） */
  x?: number;
  y?: number;

  /** 是否显示 FPS（默认 true） */
  showFps?: boolean;

  /** 是否显示组件数（默认 true） */
  showComponentCount?: boolean;

  /** 挂载位置（默认 world.root） */
  parent?: Component;
}

/**
 * DebugOverlay：用一个 TextComponent 显示 FPS、组件数等调试信息。
 * 调用 update(dt) 即可不断刷新。
 */
export class DebugOverlay {
  readonly label: TextComponent;
  readonly options: Required<Omit<DebugOverlayOptions, "parent">> & {
    parent?: Component;
  };

  private fpsAccumTime = 0;
  private fpsFrameCount = 0;
  private fps = 0;

  constructor(world: World2D, opts: DebugOverlayOptions = {}) {
    this.options = {
      x: opts.x ?? 8,
      y: opts.y ?? 8,
      showFps: opts.showFps ?? true,
      showComponentCount: opts.showComponentCount ?? true,
      parent: opts.parent
    };

    this.label = new TextComponent("", {
      fontSize: 12,
      fontFamily: "monospace",
      color: "#00ff00",
      lineHeight: 1.2
    });
    this.label.x = this.options.x;
    this.label.y = this.options.y;
    this.label.anchorX = 0;
    this.label.anchorY = 0;

    const parent = this.options.parent ?? world.root;
    parent.add(this.label);
  }

  /**
   * 每帧调用一次，用于更新 FPS 和统计信息。
   */
  update(world: World2D, dt: number): void {
    this.updateFps(dt);
    this.updateLabel(world);
  }

  // ================= 内部实现 =================

  private updateFps(dt: number): void {
    if (!this.options.showFps) return;
    this.fpsAccumTime += dt;
    this.fpsFrameCount += 1;

    // 每 0.5s 更新一次 FPS 读数
    if (this.fpsAccumTime >= 0.5) {
      this.fps = this.fpsFrameCount / this.fpsAccumTime;
      this.fpsAccumTime = 0;
      this.fpsFrameCount = 0;
    }
  }

  private updateLabel(world: World2D): void {
    const lines: string[] = [];

    if (this.options.showFps) {
      lines.push(`FPS: ${this.fps.toFixed(1)}`);
    }

    if (this.options.showComponentCount) {
      const count = countComponents(world.root);
      lines.push(`Components: ${count}`);
    }

    this.label.setText(lines.join("\n"));
  }
}

// 递归统计组件数量
function countComponents(root: Component): number {
  let count = 1; // 包含自己
  for (const child of root.children) {
    count += countComponents(child as Component);
  }
  return count;
}
