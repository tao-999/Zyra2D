import { Component } from '../../core/Component';

/**
 * Tag：给实体打标签 & 分层。
 *
 * - tag: 任意字符串，用于快速标识（比如 "player", "enemy"）
 * - layer: 层级标识（通常按位表示：1=玩家，2=敌人，4=子弹 等）
 */
export class Tag extends Component {
  tag: string | null = null;

  /**
   * layer 使用 bitmask：
   *   1 << 0 = 1
   *   1 << 1 = 2
   *   1 << 2 = 4
   *   ...
   */
  layer = 1;
}
