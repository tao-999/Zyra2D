import { Scene } from './Scene';

export class SceneManager {
  private scenes = new Map<string, Scene>();
  private current: Scene | null = null;

  register(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  setEngine(engine: any): void {
    for (const s of this.scenes.values()) {
      s.engine = engine;
    }
  }

  switchTo(name: string): void {
    const next = this.scenes.get(name);
    if (!next) throw new Error(`Scene '${name}' not found`);

    if (this.current) {
      this.current.onExit();
    }

    this.current = next;
    this.current.onEnter();
  }

  update(dt: number): void {
    if (this.current) {
      this.current.update(dt);
    }
  }
}
