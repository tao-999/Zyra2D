// packages/zryajs/src/palette/Palette.ts

export type Color = string;

export interface Palette {
  name: string;
  colors: Color[];
}

/**
 * 安全取色：支持 index 超界循环。
 */
export function getColor(palette: Palette, index: number): Color {
  const n = palette.colors.length;
  if (n === 0) return "#ffffff";
  const i = ((index % n) + n) % n;
  return palette.colors[i];
}
