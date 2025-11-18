import { Component } from '../../core/Component';

/**
 * 文本组件：用于在世界坐标系里绘制文字。
 * 实际绘制时会通过 Camera2D 转成屏幕坐标。
 */
export class Text2D extends Component {
  text = '';
  font = '16px sans-serif';
  color = '#ffffff';

  /**
   * 对齐方式：
   * - horizontal: 'left' | 'center' | 'right'
   * - vertical: 'top' | 'middle' | 'bottom'
   */
  align: 'left' | 'center' | 'right' = 'left';
  verticalAlign: 'top' | 'middle' | 'bottom' = 'top';

  maxWidth: number | undefined = undefined;
}
