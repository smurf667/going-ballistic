export class Pair {

  public x: number;
  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(other: Pair): Pair {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  public scale(factor?: number): Pair {
    if (factor === undefined) {
      factor = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.x *= factor;
    this.y *= factor;
    return this;
  }

}
