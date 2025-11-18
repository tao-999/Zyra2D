// packages/zryajs/src/render/Renderer.ts

import type { CameraComponent } from "../world/CameraComponent";
import type { SpriteComponent } from "../component/SpriteComponent";
import type { TextComponent } from "../component/TextComponent";

/**
 * 渲染抽象接口：Canvas/WebGL/TinyGL 等都实现这一套方法。
 */
export interface Renderer {
  beginFrame(): void;
  endFrame(): void;

  beginCamera(camera: CameraComponent): void;
  endCamera(): void;

  drawSprite(sprite: SpriteComponent): void;
  drawText(text: TextComponent): void;
}
