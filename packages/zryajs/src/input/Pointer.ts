// packages/zryajs/src/input/Pointer.ts

/**
 * 指针事件类型：
 * - down：按下
 * - up：抬起
 * - move：移动（按下或悬停时）
 * - click：点击（宿主可选触发）
 */
export type PointerEventType = "down" | "up" | "move" | "click";

export interface PointerEvent {
  type: PointerEventType;
  x: number;
  y: number;
  button?: number;
  /** 宿主层原始事件（MouseEvent / PointerEvent / TouchEvent 等） */
  originalEvent?: unknown;
}

/**
 * 指针回调接口：
 * - 基础：down / up / move / click
 * - 拖拽：dragStart / dragMove / dragEnd
 */
export interface PointerCallbacks {
  onPointerDown?(e: PointerEvent): void;
  onPointerUp?(e: PointerEvent): void;
  onPointerMove?(e: PointerEvent): void;
  onPointerClick?(e: PointerEvent): void;

  onPointerDragStart?(e: PointerEvent): void;
  onPointerDragMove?(e: PointerEvent): void;
  onPointerDragEnd?(e: PointerEvent): void;
}
