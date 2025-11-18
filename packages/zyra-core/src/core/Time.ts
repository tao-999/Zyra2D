/**
 * 全局时间信息，由 Engine 在每帧更新。
 *
 * - delta: 本帧耗时（秒）
 * - elapsed: 引擎启动以来累计时间（秒）
 * - frame: 帧计数，从 0 开始递增
 */
export class Time {
  /** 本帧耗时（秒） */
  delta = 0;

  /** 从 Engine.start() 到现在累计的时间（秒） */
  elapsed = 0;

  /** 帧计数，从 0 开始递增 */
  frame = 0;
}
