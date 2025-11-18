// packages/zryajs/src/component/SpriteComponent.ts

import { PositionComponent } from "./PositionComponent";
import type { Renderer } from "../render/Renderer";

/**
 * 支持的精灵图源：
 * - HTMLImageElement
 * - HTMLCanvasElement
 * - HTMLVideoElement
 * - ImageBitmap
 * 都是 CanvasRenderingContext2D.drawImage 接受的类型
 */
export type SpriteSource = CanvasImageSource;

/**
 * 精灵纹理结构：
 * - image：一张图片 / 离屏 canvas / 等
 * - sx, sy, sw, sh：从大图中裁剪哪一块（可选）
 */
export interface SpriteTexture {
  image: SpriteSource;
  sx?: number;
  sy?: number;
  sw?: number;
  sh?: number;
}

/**
 * 精灵组件：位置/缩放/旋转逻辑在 PositionComponent，
 * 具体绘制由 Renderer.drawSprite 实现。
 */
export class SpriteComponent extends PositionComponent {
  texture: SpriteTexture | null = null;

  override render(renderer: Renderer): void {
    if (!this.texture) return;
    renderer.drawSprite(this);
  }
}
