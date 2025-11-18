export interface PlayOptions {
    loop?: boolean;
    volume?: number;        // 0.0 - 1.0
    playbackRate?: number;  // 速度，默认 1
  }

  /**
   * 播放句柄：用于控制一次播放实例
   */
  export interface AudioHandle {
    readonly key: string;
    readonly audio: HTMLAudioElement;

    stop(): void;
    pause(): void;
    resume(): void;
    setVolume(v: number): void;
    isPlaying(): boolean;
  }

  /**
   * 简单声音管理器：
   * - 使用 HTMLAudioElement
   * - 支持多次同时播放同一个 key（通过 cloneNode）
   * - 区分资源加载 (load) 和 播放 (play)
   */
  export class AudioManager {
    private audios = new Map<string, HTMLAudioElement>();
    private active = new Set<AudioHandle>();

    /**
     * 预加载音频资源：
     * - key: 标识
     * - url: 资源路径
     */
    load(key: string, url: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (this.audios.has(key)) {
          resolve();
          return;
        }

        const audio = new Audio();
        audio.src = url;
        audio.preload = 'auto';

        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          this.audios.set(key, audio);
          resolve();
        };

        const onError = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error(`AudioManager: failed to load audio '${key}' from '${url}'`));
        };

        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });

        audio.load();
      });
    }

    /**
     * 播放指定 key 的音频。
     * 如果尚未 load，会直接抛错（由上层决定何时播放）。
     */
    play(key: string, options?: PlayOptions): AudioHandle {
      const base = this.audios.get(key);
      if (!base) {
        throw new Error(`AudioManager: audio '${key}' not loaded`);
      }

      // clone 一个新的元素，支持并发播放
      const audio = base.cloneNode(true) as HTMLAudioElement;

      audio.loop = options?.loop ?? false;
      audio.volume = options?.volume ?? 1;
      audio.playbackRate = options?.playbackRate ?? 1;

      // 创建 handle
      const handle: AudioHandle = {
        key,
        audio,
        stop: () => {
          audio.pause();
          audio.currentTime = 0;
          this.active.delete(handle);
        },
        pause: () => {
          audio.pause();
        },
        resume: () => {
          void audio.play();
        },
        setVolume: (v: number) => {
          audio.volume = Math.min(Math.max(v, 0), 1);
        },
        isPlaying: () => !audio.paused,
      };

      audio.addEventListener(
        'ended',
        () => {
          this.active.delete(handle);
        },
        { once: true }
      );

      this.active.add(handle);
      void audio.play();

      return handle;
    }

    /**
     * 停止当前所有正在播放的实例。
     */
    stopAll(): void {
      for (const h of Array.from(this.active)) {
        h.stop();
      }
      this.active.clear();
    }

    /**
     * 卸载资源（不影响已经在播的实例）
     */
    unload(key: string): void {
      this.audios.delete(key);
    }

    /**
     * 全部清空（资源 + 活动实例）
     */
    clear(): void {
      this.stopAll();
      this.audios.clear();
    }
  }
  