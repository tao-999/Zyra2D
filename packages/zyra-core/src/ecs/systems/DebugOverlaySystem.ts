import { System } from '../../core/System';
import type { Renderer } from '../../render/Renderer';
import { Camera2D } from '../../render/Camera2D';
import { Time } from '../../core/Time';

export interface DebugOverlayOptions {
  x?: number;              // 左上角 X
  y?: number;              // 左上角 Y
  lineHeight?: number;     // 行高
  showFPS?: boolean;
  showFrameTime?: boolean;
  showEntityCount?: boolean;
  showCameraInfo?: boolean;
  showElapsed?: boolean;
  showWorldInfo?: boolean; // 预留
}

/**
 * DebugOverlaySystem：
 * - 在屏幕左上角（可配置）绘制调试信息
 * - FPS / frame time / entity 数量 / camera 信息
 */
export class DebugOverlaySystem extends System {
  private fps = 0;
  private accumulator = 0;
  private frameCount = 0;

  private lastDt = 0;

  private options: Required<DebugOverlayOptions>;

  constructor(
    private readonly renderer: Renderer,
    private readonly camera: Camera2D,
    private readonly time: Time,
    options?: DebugOverlayOptions
  ) {
    super();

    this.options = {
      x: options?.x ?? 10,
      y: options?.y ?? 10,
      lineHeight: options?.lineHeight ?? 16,
      showFPS: options?.showFPS ?? true,
      showFrameTime: options?.showFrameTime ?? true,
      showEntityCount: options?.showEntityCount ?? true,
      showCameraInfo: options?.showCameraInfo ?? true,
      showElapsed: options?.showElapsed ?? false,
      showWorldInfo: options?.showWorldInfo ?? false,
    };
  }

  update(dt: number): void {
    this.lastDt = dt;

    // 计算 FPS（用 0.5s 平滑）
    this.accumulator += dt;
    this.frameCount++;
    if (this.accumulator >= 0.5) {
      this.fps = this.frameCount / this.accumulator;
      this.accumulator = 0;
      this.frameCount = 0;
    }

    const lines: string[] = [];

    if (this.options.showFPS) {
      lines.push(`FPS: ${this.fps.toFixed(1)}`);
    }
    if (this.options.showFrameTime) {
      lines.push(`Frame: ${(this.lastDt * 1000).toFixed(2)} ms`);
    }
    if (this.options.showEntityCount) {
      lines.push(`Entities: ${this.world.entities.length}`);
    }
    if (this.options.showCameraInfo) {
      lines.push(
        `Camera: x=${this.camera.x.toFixed(1)}, y=${this.camera.y.toFixed(
          1
        )}, zoom=${this.camera.zoom.toFixed(2)}`
      );
    }
    if (this.options.showElapsed) {
      lines.push(`Elapsed: ${this.time.elapsed.toFixed(2)} s`);
      lines.push(`Frame#${this.time.frame}`);
    }

    if (lines.length === 0) return;

    const x = this.options.x;
    const y = this.options.y;
    const lh = this.options.lineHeight;

    // 背景框：根据最长行长度粗略估计宽度
    const maxLen = lines.reduce((m, s) => Math.max(m, s.length), 0);
    const width = maxLen * 7 + 10; // 粗略估算字符宽度
    const height = lines.length * lh + 6;

    this.renderer.drawRect(x - 4, y - 4, width, height, {
      filled: true,
      color: 'rgba(0,0,0,0.5)',
    });

    // 文本
    let cy = y;
    for (const line of lines) {
      this.renderer.drawText(line, x, cy, {
        font: '12px monospace',
        color: '#00ff00',
        textAlign: 'left',
        textBaseline: 'top',
      });
      cy += lh;
    }
  }
}
