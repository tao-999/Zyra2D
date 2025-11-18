export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

/**
 * 默认基于 console 的 Logger。
 * 提供一个静态开关 enableDebug 来控制是否输出 debug 日志。
 */
export class ConsoleLogger implements Logger {
  /** 控制是否输出 debug 日志 */
  static enableDebug = true;

  debug(...args: any[]): void {
    if (!ConsoleLogger.enableDebug) return;
    // eslint-disable-next-line no-console
    console.debug('[Zyra2D]', ...args);
  }

  info(...args: any[]): void {
    // eslint-disable-next-line no-console
    console.info('[Zyra2D]', ...args);
  }

  warn(...args: any[]): void {
    // eslint-disable-next-line no-console
    console.warn('[Zyra2D]', ...args);
  }

  error(...args: any[]): void {
    // eslint-disable-next-line no-console
    console.error('[Zyra2D]', ...args);
  }
}
