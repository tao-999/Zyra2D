import { Component } from '../core/Component';

/**
 * 屏幕空间矩形 UI（不受相机影响）
 */
export class UIRect extends Component {
  x = 0; // 屏幕左上角
  y = 0;
  width = 100;
  height = 40;

  color = '#222222';
  opacity = 1;
  radius = 0; // 圆角
}
