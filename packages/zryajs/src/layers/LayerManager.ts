// packages/zryajs/src/layers/LayerManager.ts

import type { World2D } from "../world/World2D";
import { Component } from "../component/Component";

export type LayerId = string;

/**
 * 简易图层管理：
 * - 每个 layer 对应一个 Component 容器
 * - 添加顺序即渲染顺序（先加在下，后加在上）
 */
export class LayerManager {
  private readonly layers = new Map<LayerId, Component>();

  constructor(private readonly world: World2D) {}

  ensureLayer(id: LayerId): Component {
    let c = this.layers.get(id);
    if (c) return c;

    c = new Component();
    this.world.root.add(c);
    this.layers.set(id, c);
    return c;
  }

  getLayer(id: LayerId): Component | undefined {
    return this.layers.get(id);
  }

  getAllLayers(): ReadonlyMap<LayerId, Component> {
    return this.layers;
  }
}
