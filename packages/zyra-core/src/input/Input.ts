/**
 * 基础输入管理：
 * - 键盘：按下、按住、抬起
 * - 鼠标：位置 + 左键状态
 *
 * 使用方式：
 *   engine.input.isKeyDown('ArrowLeft')
 *   engine.input.isKeyPressed('Space')
 *   engine.input.mouseX / mouseY
 */
type Key = string;

export class Input {
  private keysDown = new Set<Key>();
  private keysPressed = new Set<Key>();
  private keysReleased = new Set<Key>();

  mouseX = 0;
  mouseY = 0;
  mouseDown = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    // 键盘事件监听在 window 上
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // 鼠标事件绑定到 canvas / window
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
  }

  /**
   * 每帧开始时调用，清空本帧的 pressed/released。
   * Engine.loop 会在 world.update 之前调用。
   */
  beginFrame(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  // --- keyboard ---

  private onKeyDown = (ev: KeyboardEvent): void => {
    const key = ev.key;
    if (!this.keysDown.has(key)) {
      this.keysPressed.add(key);
    }
    this.keysDown.add(key);
  };

  private onKeyUp = (ev: KeyboardEvent): void => {
    const key = ev.key;
    if (this.keysDown.has(key)) {
      this.keysReleased.add(key);
    }
    this.keysDown.delete(key);
  };

  isKeyDown(key: Key): boolean {
    return this.keysDown.has(key);
  }

  /**
   * 本帧是否刚按下（从未按 → 按下）
   */
  isKeyPressed(key: Key): boolean {
    return this.keysPressed.has(key);
  }

  /**
   * 本帧是否刚抬起（按下 → 抬起）
   */
  isKeyReleased(key: Key): boolean {
    return this.keysReleased.has(key);
  }

  // --- mouse ---

  private onMouseDown = (_ev: MouseEvent): void => {
    this.mouseDown = true;
  };

  private onMouseUp = (_ev: MouseEvent): void => {
    this.mouseDown = false;
  };

  private onMouseMove = (ev: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = ev.clientX - rect.left;
    this.mouseY = ev.clientY - rect.top;
  };

  // --- cleanup ---

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
  }
}
