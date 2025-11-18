// packages/zryajs/src/input/InputRouter.ts

import type { Component } from "../component/Component";
import { PositionComponent } from "../component/PositionComponent";
import type { PointerCallbacks, PointerEvent } from "./Pointer";
import type { KeyboardCallbacks, KeyboardEventInfo } from "./Keyboard";

/**
 * 输入路由：
 * - 不直接依赖 DOM
 * - 宿主捕获浏览器事件后，转换成 PointerEvent / KeyboardEventInfo
 * - 通过 InputRouter.dispatchXXX 分发到组件树
 *
 * 支持：
 * - pointer: down / up / move / click
 * - drag: 自动识别拖拽（基于按下+移动，并有阈值）
 * - keyboard: keydown / keyup
 */
export class InputRouter {
  // ===== pointer / drag 状态 =====
  private static pointerDown = false;
  private static downX = 0;
  private static downY = 0;

  private static lastX = 0;
  private static lastY = 0;

  private static dragTarget: PointerCallbacks & PositionComponent | null = null;
  private static dragCandidate: PointerCallbacks & PositionComponent | null = null;

  private static readonly DRAG_THRESHOLD = 4; // 像素

  /**
   * 指针事件派发。
   * 注意：x/y 应该是 “世界坐标”。
   */
  static dispatchPointer(root: Component, e: PointerEvent): void {
    switch (e.type) {
      case "down":
        this.handlePointerDown(root, e);
        break;
      case "move":
        this.handlePointerMove(root, e);
        break;
      case "up":
        this.handlePointerUp(root, e);
        break;
      case "click":
        this.handlePointerClick(root, e);
        break;
      default:
        break;
    }
  }

  /**
   * 键盘事件派发。
   */
  static dispatchKeyboard(
    root: Component,
    e: KeyboardEventInfo,
    type: "down" | "up"
  ): void {
    traverseComponents(root, (comp) => {
      const cb = comp as unknown as KeyboardCallbacks;
      if (!hasKeyboardCallbacks(cb)) return;

      if (type === "down") {
        cb.onKeyDown?.(e);
      } else {
        cb.onKeyUp?.(e);
      }
    });
  }

  // ================== pointer 内部逻辑 ==================

  private static handlePointerDown(root: Component, e: PointerEvent): void {
    this.pointerDown = true;
    this.downX = e.x;
    this.downY = e.y;
    this.lastX = e.x;
    this.lastY = e.y;
    this.dragTarget = null;

    // 选中顶部命中组件作为 dragCandidate
    const hit = findTopMostHit(root, e.x, e.y);
    if (!hit) return;

    const { callbacks } = hit;
    callbacks.onPointerDown?.(e);

    // 如果它有拖拽回调，记录为潜在拖拽目标
    if (
      typeof callbacks.onPointerDragStart === "function" ||
      typeof callbacks.onPointerDragMove === "function" ||
      typeof callbacks.onPointerDragEnd === "function"
    ) {
      this.dragCandidate = hit.component as PointerCallbacks & PositionComponent;
    } else {
      this.dragCandidate = null;
    }
  }

  private static handlePointerMove(root: Component, e: PointerEvent): void {
    const dx = e.x - this.downX;
    const dy = e.y - this.downY;

    // 已经在拖拽中
    if (this.dragTarget) {
      this.dragTarget.onPointerDragMove?.(e);
      this.lastX = e.x;
      this.lastY = e.y;
      return;
    }

    // 还没触发拖拽，但处于按下状态，有 dragCandidate
    if (this.pointerDown && this.dragCandidate) {
      const dist2 = dx * dx + dy * dy;
      if (dist2 >= this.DRAG_THRESHOLD * this.DRAG_THRESHOLD) {
        // 触发拖拽开始
        this.dragTarget = this.dragCandidate;
        this.dragCandidate = null;
        this.dragTarget.onPointerDragStart?.(e);
        this.dragTarget.onPointerDragMove?.(e);
        this.lastX = e.x;
        this.lastY = e.y;
        return;
      }
    }

    // 普通 move，分发给当前鼠标所在组件（可选，看你宿主想不想用）
    const hit = findTopMostHit(root, e.x, e.y);
    if (!hit) return;
    hit.callbacks.onPointerMove?.(e);
  }

  private static handlePointerUp(root: Component, e: PointerEvent): void {
    // 结束拖拽
    if (this.dragTarget) {
      this.dragTarget.onPointerDragEnd?.(e);
      this.dragTarget = null;
      this.dragCandidate = null;
      this.pointerDown = false;
      return;
    }

    // 没有拖拽，仅仅是点击释放
    const hit = findTopMostHit(root, e.x, e.y);
    if (!hit) {
      this.pointerDown = false;
      this.dragCandidate = null;
      return;
    }

    hit.callbacks.onPointerUp?.(e);
    this.pointerDown = false;
    this.dragCandidate = null;
  }

  private static handlePointerClick(root: Component, e: PointerEvent): void {
    // 简单起见，click 就重新做一次 hitTest
    const hit = findTopMostHit(root, e.x, e.y);
    if (!hit) return;
    hit.callbacks.onPointerClick?.(e);
  }
}

// ======== 工具函数：遍历 / hitTest / type guard ========

function traverseComponents(root: Component, fn: (c: Component) => void): void {
  fn(root);
  for (const child of root.children) {
    traverseComponents(child, fn);
  }
}

function findTopMostHit(
  root: Component,
  x: number,
  y: number
): {
  component: PositionComponent;
  callbacks: PointerCallbacks;
} | null {
  const list: PositionComponent[] = [];

  traverseComponents(root, (comp) => {
    const pc = comp as unknown as PositionComponent;
    if (!isPositionComponent(pc)) return;
    if (hitTest(pc, x, y)) {
      list.push(pc);
    }
  });

  if (list.length === 0) return null;

  // 后添加的在数组后面，视为“上层”
  const top = list[list.length - 1];
  const callbacks = top as unknown as PointerCallbacks;

  if (!hasPointerCallbacks(callbacks)) {
    return null;
  }

  return { component: top, callbacks };
}

function isPositionComponent(c: any): c is PositionComponent {
  return (
    c instanceof PositionComponent ||
    (typeof c.x === "number" &&
      typeof c.y === "number" &&
      typeof c.width === "number" &&
      typeof c.height === "number")
  );
}

function hasPointerCallbacks(c: any): c is PointerCallbacks {
  return (
    typeof c.onPointerDown === "function" ||
    typeof c.onPointerUp === "function" ||
    typeof c.onPointerMove === "function" ||
    typeof c.onPointerClick === "function" ||
    typeof c.onPointerDragStart === "function" ||
    typeof c.onPointerDragMove === "function" ||
    typeof c.onPointerDragEnd === "function"
  );
}

function hasKeyboardCallbacks(c: any): c is KeyboardCallbacks {
  return (
    typeof c.onKeyDown === "function" ||
    typeof c.onKeyUp === "function"
  );
}

/**
 * 简单 AABB hitTest：不考虑旋转缩放，只看基础矩形。
 * 坐标需为世界坐标。
 */
function hitTest(
  pc: PositionComponent,
  x: number,
  y: number
): boolean {
  const w = pc.width;
  const h = pc.height;

  if (w <= 0 || h <= 0) return false;

  const left = pc.x - w * pc.anchorX;
  const top = pc.y - h * pc.anchorY;
  const right = left + w;
  const bottom = top + h;

  return x >= left && x <= right && y >= top && y <= bottom;
}
