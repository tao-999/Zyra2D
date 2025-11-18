import { Component } from '../../core/Component';

/**
 * 网格瓦片地图：
 * - 使用一张 tileset 图（spritesheet）
 * - tile 宽高固定
 * - tiles 为一维数组，长度 = width * height
 * - index = 0 表示空 tile，其余 index 对应 tileset 中的格子（从 1 开始）
 */
export class TileMap2D extends Component {
  /** 每个 tile 的像素宽度/高度 */
  tileWidth = 32;
  tileHeight = 32;

  /** 地图尺寸（单位：格子） */
  width = 0;
  height = 0;

  /**
   * 瓦片索引：
   * - 长度 = width * height
   * - 访问时：tiles[y * width + x]
   */
  tiles: number[] = [];

  /**
   * tileset 图在 AssetManager 中的 key
   */
  tilesetKey = '';

  /**
   * tileset 每行包含多少个 tile（决定 index -> (sx, sy) 的计算）
   */
  tilesetColumns = 1;

  /** tileset 边缘空白距离（像素） */
  margin = 0;

  /** tileset 中相邻 tile 之间的间隔（像素） */
  spacing = 0;

  /**
   * 地图原点相对 Transform 的偏移（世界坐标）
   * - 默认 0,0 代表 Transform.x/y 就是地图左上角
   */
  offsetX = 0;
  offsetY = 0;
}
