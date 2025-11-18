// packages/zryajs/src/input/Keyboard.ts

/**
 * 键盘事件回调接口。
 * 未来可以挂在 Component 上，由宿主负责事件派发。
 */
export interface KeyboardEventInfo {
  code: string;
  key?: string;
  originalEvent?: unknown;
}

export interface KeyboardCallbacks {
  onKeyDown?(e: KeyboardEventInfo): void;
  onKeyUp?(e: KeyboardEventInfo): void;
}
