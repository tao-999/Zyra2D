/**
 * v0.1 资源管理器：
 * 只做 Image 加载 + 缓存。
 */
export class AssetManager {
  private imageCache = new Map<string, HTMLImageElement>();

  async loadImage(key: string, url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    const img = new Image();
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });

    this.imageCache.set(key, img);
    return img;
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.imageCache.get(key);
  }

  hasImage(key: string): boolean {
    return this.imageCache.has(key);
  }

  clear(): void {
    this.imageCache.clear();
  }
}
