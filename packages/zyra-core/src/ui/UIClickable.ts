import { Component } from '../core/Component';

/** UI 点击组件：用于检测鼠标点击 */
export class UIClickable extends Component {
  onClick: (() => void) | null = null;
}
