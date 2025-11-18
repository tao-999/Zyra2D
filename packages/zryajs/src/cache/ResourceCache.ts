// packages/zryajs/src/cache/ResourceCache.ts

export type ResourceLoader<K, V> = (key: K) => Promise<V> | V;

/**
 * 通用资源缓存：
 * - 内部有两层：
 *   1) map:       已经成功加载完毕的资源
 *   2) inFlight:  正在加载中的 Promise，避免重复加载
 *
 * 用于图片、音频等资源的集中管理。
 */
export class ResourceCache<K, V> {
  private readonly map = new Map<K, V>();
  private readonly inFlight = new Map<K, Promise<V>>();

  constructor(private readonly loader?: ResourceLoader<K, V>) {}

  // ======= 基础 Map 封装 =======

  has(key: K): boolean {
    return this.map.has(key);
  }

  /**
   * 是否当前有这个 key 正在加载中（还没放进 map）。
   */
  isLoading(key: K): boolean {
    return this.inFlight.has(key);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  /**
   * 同步 set：通常用于预加载完之后手动塞资源。
   */
  set(key: K, value: V): void {
    this.map.set(key, value);
  }

  delete(key: K): void {
    this.map.delete(key);
    this.inFlight.delete(key);
  }

  clear(): void {
    this.map.clear();
    this.inFlight.clear();
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  get size(): number {
    return this.map.size;
  }

  // ======= 核心：带 in-flight 合并的加载 =======

  /**
   * getOrLoad：
   *   - 若缓存中已有 → 直接返回值（同步包装成 Promise）
   *   - 若正在加载中 → 复用同一个 Promise，不重复触发 loader
   *   - 否则         → 调用 loader，并记录到 inFlight；成功后写入 map、删除 inFlight；失败则删除 inFlight 并抛出
   */
  async getOrLoad(key: K, loader?: ResourceLoader<K, V>): Promise<V> {
    // 1) 已有缓存
    const existing = this.map.get(key);
    if (existing !== undefined) {
      return existing;
    }

    // 2) 正在加载中 → 直接复用 Promise
    const pending = this.inFlight.get(key);
    if (pending) {
      return pending;
    }

    // 3) 需要启动新的加载
    const useLoader = loader ?? this.loader;
    if (!useLoader) {
      throw new Error("[zryajs] ResourceCache: no loader provided");
    }

    const promise = (async () => {
      try {
        const value = await useLoader(key);
        this.map.set(key, value);
        this.inFlight.delete(key);
        return value;
      } catch (err) {
        // 保证失败不会一直占着 inFlight
        this.inFlight.delete(key);
        throw err;
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}
