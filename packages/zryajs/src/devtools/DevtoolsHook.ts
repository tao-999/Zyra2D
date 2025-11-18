// packages/zryajs/src/devtools/DevtoolsHook.ts

import type { ZryaGame } from "../game/ZryaGame";

export interface DevtoolsAdapter {
  onGameMounted(game: ZryaGame): void;
  onGameUnmounted(game: ZryaGame): void;
}

class DevtoolsRegistry {
  adapter: DevtoolsAdapter | null = null;
  currentGame: ZryaGame | null = null;
}

const registry = new DevtoolsRegistry();

/**
 * 在宿主环境注册一个 devtools 适配器（比如浏览器扩展）。
 */
export function attachDevtools(adapter: DevtoolsAdapter): void {
  registry.adapter = adapter;
  if (registry.currentGame) {
    adapter.onGameMounted(registry.currentGame);
  }
}

export function detachDevtools(): void {
  registry.adapter = null;
}

/**
 * 由游戏层主动通知 devtools：当前 game 挂载。
 */
export function notifyGameMounted(game: ZryaGame): void {
  registry.currentGame = game;
  registry.adapter?.onGameMounted(game);
}

/**
 * 由游戏层主动通知 devtools：当前 game 卸载。
 */
export function notifyGameUnmounted(game: ZryaGame): void {
  if (registry.currentGame === game) {
    registry.currentGame = null;
  }
  registry.adapter?.onGameUnmounted(game);
}
