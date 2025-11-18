import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Camera2D } from '../../render/Camera2D';
import type { AssetManager } from '../../assets/AssetManager';
import { Transform } from '../components/Transform';
import { TileMap2D } from '../components/TileMap2D';

/**
 * TileMapRenderSystem：
 * - 遍历所有带 Transform + TileMap2D 的实体
 * - 用 Camera2D 做视口裁剪，只画可见区域
 * - 使用 Renderer.drawSpriteRegion 从 tileset 图上截 tile
 */
export class TileMapRenderSystem extends System {
  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera2D,
    private readonly assets: AssetManager
  ) {
    super();
  }

  update(dt: number): void {
    void dt;

    const zoom = this.camera.zoom;
    const halfW = this.camera.viewportWidth / 2 / zoom;
    const halfH = this.camera.viewportHeight / 2 / zoom;

    const viewLeft = this.camera.x - halfW;
    const viewRight = this.camera.x + halfW;
    const viewTop = this.camera.y - halfH;
    const viewBottom = this.camera.y + halfH;

    for (const e of this.world.entities) {
      const t = e.getComponent(Transform);
      const map = e.getComponent(TileMap2D);
      if (!t || !map || !map.tilesetKey) continue;

      const image = this.assets.getImage(map.tilesetKey);
      if (!image) continue;

      const { tileWidth, tileHeight } = map;

      const originX = t.x + map.offsetX;
      const originY = t.y + map.offsetY;

      // 视口覆盖的 tile index 范围
      const startCol = Math.max(
        0,
        Math.floor((viewLeft - originX) / tileWidth)
      );
      const endCol = Math.min(
        map.width - 1,
        Math.floor((viewRight - originX) / tileWidth)
      );
      const startRow = Math.max(
        0,
        Math.floor((viewTop - originY) / tileHeight)
      );
      const endRow = Math.min(
        map.height - 1,
        Math.floor((viewBottom - originY) / tileHeight)
      );

      if (startCol > endCol || startRow > endRow) {
        continue;
      }

      const cols = map.tilesetColumns;
      const { margin, spacing } = map;

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const index = map.tiles[y * map.width + x] | 0;
          if (index <= 0) continue;

          const tileIndex = index - 1;
          const tx = tileIndex % cols;
          const ty = Math.floor(tileIndex / cols);

          const sx =
            margin + tx * (tileWidth + spacing);
          const sy =
            margin + ty * (tileHeight + spacing);

          // tile 左上角的世界坐标
          const worldX = originX + x * tileWidth;
          const worldY = originY + y * tileHeight;

          // 我们以 tile 中心作为 worldToScreen 输入
          const centerX = worldX + tileWidth / 2;
          const centerY = worldY + tileHeight / 2;

          const screen = this.camera.worldToScreen(centerX, centerY);

          this.renderer.drawSpriteRegion(
            image,
            sx,
            sy,
            tileWidth,
            tileHeight,
            screen.x,
            screen.y,
            0,         // rotation
            zoom,
            zoom,
            tileWidth / 2,
            tileHeight / 2
          );
        }
      }
    }
  }
}
