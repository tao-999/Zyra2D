import type { World } from '../../core/World';
import type { Entity } from '../../core/Entity';
import { Transform } from '../components/Transform';
import { ColliderAABB } from '../components/ColliderAABB';
import { PhysicsBody2D, type BodyType2D } from '../components/PhysicsBody2D';
import { TileMap2D } from '../components/TileMap2D';

export interface TileMapColliderOptions {
  /**
   * 哪些 tile index 视为“实心”（会生成碰撞体）
   * - 0 仍然表示空
   * - 通常你会传 [1,2,3,...] 或一个 Set
   */
  solidIndices: number[] | Set<number>;

  /** 刚体类型，默认 'static' */
  bodyType?: BodyType2D;

  /**
   * 是否按行合并连续的 solid tile，减少 Collider 数量。
   * - true：将同一行连续砖块合并成一个长方形碰撞体
   * - false：一个 tile 一个 Collider
   */
  mergeHorizontal?: boolean;
}

/**
 * 根据 TileMap2D 为地图生成静态碰撞体。
 *
 * 返回新建的 collider 实体数组，方便你后续再做管理（比如统一销毁）。
 */
export function createCollidersFromTileMap(
  world: World,
  mapEntity: Entity,
  options: TileMapColliderOptions
): Entity[] {
  const map = mapEntity.getComponent(TileMap2D);
  const baseTransform = mapEntity.getComponent(Transform);
  if (!map || !baseTransform) {
    throw new Error('createCollidersFromTileMap: mapEntity must have TileMap2D + Transform');
  }

  const solidSet =
    options.solidIndices instanceof Set
      ? options.solidIndices
      : new Set(options.solidIndices ?? []);

  const bodyType: BodyType2D = options.bodyType ?? 'static';
  const mergeHorizontal = options.mergeHorizontal ?? true;

  const created: Entity[] = [];

  const { tileWidth, tileHeight, width, height } = map;
  const originX = baseTransform.x + map.offsetX;
  const originY = baseTransform.y + map.offsetY;

  for (let y = 0; y < height; y++) {
    if (mergeHorizontal) {
      let runStart = -1;

      for (let x = 0; x <= width; x++) {
        const index = x < width ? map.tiles[y * width + x] | 0 : 0;
        const solid = index > 0 && solidSet.has(index);

        if (solid) {
          if (runStart === -1) runStart = x;
        } else if (runStart !== -1) {
          // 结束一段连续 solid
          const runEnd = x - 1;
          const runLen = runEnd - runStart + 1;

          const worldX = originX + runStart * tileWidth;
          const worldY = originY + y * tileHeight;

          const e = world.createEntity();
          const t = e.addComponent(Transform);
          t.x = worldX;
          t.y = worldY;

          const c = e.addComponent(ColliderAABB);
          c.offsetX = 0;
          c.offsetY = 0;
          c.width = runLen * tileWidth;
          c.height = tileHeight;

          const body = e.addComponent(PhysicsBody2D);
          body.type = bodyType;

          created.push(e);

          runStart = -1;
        }
      }
    } else {
      // 不合并：每个 solid tile 一个 collider
      for (let x = 0; x < width; x++) {
        const index = map.tiles[y * width + x] | 0;
        if (index <= 0 || !solidSet.has(index)) continue;

        const worldX = originX + x * tileWidth;
        const worldY = originY + y * tileHeight;

        const e = world.createEntity();
        const t = e.addComponent(Transform);
        t.x = worldX;
        t.y = worldY;

        const c = e.addComponent(ColliderAABB);
        c.offsetX = 0;
        c.offsetY = 0;
        c.width = tileWidth;
        c.height = tileHeight;

        const body = e.addComponent(PhysicsBody2D);
        body.type = bodyType;

        created.push(e);
      }
    }
  }

  return created;
}
