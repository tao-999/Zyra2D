import { Component } from '../../core/Component';

/**
 * Sprite component: holds a texture reference.
 * For v0.1 it's just a single HTMLImageElement.
 * Later this can become texture ID / sub-rect etc.
 */
export class Sprite extends Component {
  image: HTMLImageElement | null = null;
  textureName: string | null = null;

  width = 0;
  height = 0;
}
