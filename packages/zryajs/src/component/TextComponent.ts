// packages/zryajs/src/component/TextComponent.ts

import { PositionComponent } from "./PositionComponent";
import type { Renderer } from "../render/Renderer";

export type TextAlign = "left" | "center" | "right";

export interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: TextAlign;
  lineHeight?: number;
  maxWidth?: number;
}

/**
 * 文本组件：用于 HUD / Debug / UI 文本等。
 * 具体绘制由 Renderer.drawText 实现。
 */
export class TextComponent extends PositionComponent {
  text: string;
  style: TextStyle;

  constructor(text: string = "", style: TextStyle = {}) {
    super();
    this.text = text;
    this.style = {
      fontSize: 14,
      fontFamily: "sans-serif",
      fontWeight: "normal",
      color: "#ffffff",
      align: "left",
      lineHeight: 1.2,
      maxWidth: undefined,
      ...style
    };
  }

  setText(text: string): void {
    this.text = text;
  }

  setStyle(style: Partial<TextStyle>): void {
    this.style = { ...this.style, ...style };
  }

  override render(renderer: Renderer): void {
    if (!this.text) return;
    renderer.drawText(this);
  }
}
