// packages/zryajs/src/ui/UiElement.ts

import { PositionComponent } from "../component/PositionComponent";
import type {
  PointerCallbacks,
  PointerEvent
} from "../input/Pointer";

/**
 * UiElement：
 * - 用来做按钮、面板之类的交互 UI 元素
 * - 继承 PositionComponent，带 x/y/width/height
 * - 同时实现 PointerCallbacks 接口（组件里按需实现对应方法）
 */
export class UiElement
  extends PositionComponent
  implements PointerCallbacks
{
  // 点击/按下/移动
  onPointerDown?(e: PointerEvent): void;
  onPointerUp?(e: PointerEvent): void;
  onPointerMove?(e: PointerEvent): void;
  onPointerClick?(e: PointerEvent): void;

  // 拖拽
  onPointerDragStart?(e: PointerEvent): void;
  onPointerDragMove?(e: PointerEvent): void;
  onPointerDragEnd?(e: PointerEvent): void;
}
