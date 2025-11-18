import { Component } from '../core/Component';

/** 屏幕空间文本 */
export class UIText extends Component {
  text = '';
  x = 0;
  y = 0;

  font = '16px sans-serif';
  color = '#ffffff';

  align: CanvasTextAlign = 'left';
  baseline: CanvasTextBaseline = 'top';
}
