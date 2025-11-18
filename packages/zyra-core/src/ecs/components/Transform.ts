import { Component } from '../../core/Component';

/**
 * 基础 2D 变换组件。
 *
 * - (x, y): 世界坐标
 * - rotation: 旋转（弧度）
 * - scaleX / scaleY: 缩放
 * - z: 渲染层级（越大越靠上）
 */
export class Transform extends Component {
  x = 0;
  y = 0;
  rotation = 0;
  scaleX = 1;
  scaleY = 1;

  /**
   * 渲染层级：
   * - 数值越小越先画
   * - 数值越大越后画（在上面）
   */
  z = 0;
}
