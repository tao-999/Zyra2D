import type { AssetManager } from './AssetManager';

export class Preloader {
  constructor(private readonly assets: AssetManager) {}

  async loadImages(keys: { key: string; url: string }[], onProgress?: (p: number) => void) {
    const total = keys.length;
    let loaded = 0;

    for (const item of keys) {
      await this.assets.loadImage(item.key, item.url);
      loaded++;
      if (onProgress) onProgress(loaded / total);
    }
  }
}
