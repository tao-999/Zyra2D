import { Component } from '../../core/Component';

/**
 * Sprite 组件：持有一张图片引用。
 * 之后可以扩展为：纹理ID / atlas子区域等。
 */
export class Sprite extends Component {
  image: HTMLImageElement | null = null;
  textureName: string | null = null;

  width = 0;
  height = 0;
}
