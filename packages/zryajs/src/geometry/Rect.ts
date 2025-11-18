// packages/zryajs/src/geometry/Rect.ts

export class Rect {
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}

  get left(): number {
    return this.x;
  }

  get top(): number {
    return this.y;
  }

  get right(): number {
    return this.x + this.width;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.left &&
      px <= this.right &&
      py >= this.top &&
      py <= this.bottom
    );
  }

  intersects(other: Rect): boolean {
    return !(
      this.right <= other.left ||
      this.left >= other.right ||
      this.bottom <= other.top ||
      this.top >= other.bottom
    );
  }
}
