export abstract class Scene {
  /** 引擎实例会被 SceneManager 塞进来 */
  engine: any;

  /** 场景切换进入时调用 */
  onEnter(): void {}

  /** 场景被切换出去时调用 */
  onExit(): void {}

  /**
   * 每帧更新
   * 抽象方法留给具体场景实现，这里不提供默认实现，
   * 这样 TS 就不会报 dt 未使用。
   */
  abstract update(dt: number): void;
}
