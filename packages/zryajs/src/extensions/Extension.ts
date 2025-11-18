// packages/zryajs/src/extensions/Extension.ts

import type { ZryaGame } from "../game/ZryaGame";

/**
 * zryajs 扩展接口：
 * - attach 时可以在 game 上注册系统、hook 等
 */
export interface ZryaExtension {
  id: string;
  attach(game: ZryaGame): void;
  detach?(game: ZryaGame): void;
}
