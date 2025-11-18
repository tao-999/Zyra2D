type Key = string;

/**
 * 基础输入管理：
 * - 键盘：按下、按住、抬起
 * - 鼠标：位置 + 左键状态 + 本帧点击
 *
 * 使用方式：
 *   input.isKeyDown('ArrowLeft')
 *   input.isKeyPressed('Space')
 *   input.isKeyReleased('Space')
 *   input.mouseDown
 *   input.mousePressed(0) // 本帧是否刚点击左键
 *   input.mouseX / mouseY
 */
export class Input {
  private keysDown = new Set<Key>();
  private keysPressed = new Set<Key>();
  private keysReleased = new Set<Key>();

  /** 鼠标位置（相对 canvas 左上角） */
  mouseX = 0;
  mouseY = 0;

  /** 是否有任意鼠标键按下（主要是左键） */
  mouseDown = false;

  /** 本帧刚按下的鼠标键集合（0=左键,1=中键,2=右键） */
  private mousePressedButtons = new Set<number>();

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
   * 每帧开始时调用，清空本帧的 pressed/released 状态。
   * Engine.loop 会在 world.update 之前调用。
   */
  beginFrame(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mousePressedButtons.clear();
  }

  // ---------- keyboard ----------

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

  /** 本帧是否刚按下（从未按 → 按下） */
  isKeyPressed(key: Key): boolean {
    return this.keysPressed.has(key);
  }

  /** 本帧是否刚抬起（按下 → 抬起） */
  isKeyReleased(key: Key): boolean {
    return this.keysReleased.has(key);
  }

  // ---------- mouse ----------

  private onMouseDown = (ev: MouseEvent): void => {
    this.mouseDown = true;
    this.mousePressedButtons.add(ev.button);
  };

  private onMouseUp = (_ev: MouseEvent): void => {
    this.mouseDown = false;
  };

  private onMouseMove = (ev: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = ev.clientX - rect.left;
    this.mouseY = ev.clientY - rect.top;
  };

  /**
   * 本帧是否刚按下指定鼠标键：
   * - 0: 左键
   * - 1: 中键
   * - 2: 右键
   */
  mousePressed(button: number): boolean {
    return this.mousePressedButtons.has(button);
  }

  // ---------- cleanup ----------

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
  }
}
