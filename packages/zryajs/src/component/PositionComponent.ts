// packages/zryajs/src/component/PositionComponent.ts

import { Component } from "./Component";

/**
 * 带位移/缩放/旋转的组件基类。
 * 大多可视组件都应继承它。
 */
export class PositionComponent extends Component {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  scaleX = 1;
  scaleY = 1;
  angle = 0; // radians

  // 0~1，决定旋转/缩放中心
  anchorX = 0.5;
  anchorY = 0.5;
}
