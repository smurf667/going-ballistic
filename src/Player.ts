import {Animation} from "./Animation";
import {Camera} from "./Camera";
import {Car} from "./Car";

export class Player extends Car {

  // make the player mask the standard 16x16 size
  private static reduceMasks(animation: Animation): Animation {
    const first = animation.mask();
    if (first.length === 64) {
      let current = first;
      do {
        Player.scaleMaskArray(current);
        for (const row of current) {
          Player.scaleMaskArray(row);
        }
        animation.step();
        current = animation.mask();
      } while (current !== first);
    }
    return animation;
  }

  private static scaleMaskArray(arr: any[]): void {
    const head: any[] = [];
    const len = arr.length;
    for (let i = 0; i < len; i += 4) {
      head.push(arr[i]);
    }
    for (let i = head.length - 1; i >= 0; i--) {
      arr.unshift(head[i]);
    }
    arr.splice(head.length);
  }

  private jumper: number;
  private duration: number;
  private readonly width: number; // TODO use more readonly in classes
  private energy: number; // jump energy
  private score: number;

  public constructor(
    animation: Animation,
    explosion: Animation,
    x: number,
    y: number,
    weight: number,
    speed: number,
    max: number,
    score: number,
  ) {
    super(Player.reduceMasks(animation), explosion, x, y, weight, speed, max);
    this.jumper = 0;
    this.energy = 0;
    this.width = animation.width();
    this.scale = 0.25; // TODO smells like a constant
    this.score = score;
    this.duration = 0;
  }

  public render(context: CanvasRenderingContext2D, camera: Camera): void {
    if (!this.jumping()) {
      this.score += Math.floor(this.speed);
    }
    super.render(context, camera);
    if (this.health > 0) {
      const gradient = context.createLinearGradient(0, 0, 96 * 2, 0);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(0.5, "yellow");
      gradient.addColorStop(1, "#009b1a");
      context.fillStyle = gradient;
      context.lineWidth = 1;
      context.strokeStyle = "#333";
      for (let i = 0; i < this.health; i++) {
        context.fillRect(8 + i * 12, 8, 9, 4);
        context.strokeRect(8 + i * 12, 8, 9, 4);
      }
    }
    if (this.energy > 0) {
      const gradient = context.createLinearGradient(0, 0, 96 * 2, 0);
      gradient.addColorStop(0, "#009b1a");
      gradient.addColorStop(0.5, "yellow");
      gradient.addColorStop(1, "red");
      context.fillStyle = gradient;
      context.fillRect(8, 14, this.energy * 2, 4);
    }
    const text = this.score.toString();
    context.font = "32px Sans-serif";
    context.lineWidth = 4;
    context.textAlign = "right";
    context.strokeStyle = "black";
    context.strokeText(text, 512 - 8, 32);
    context.fillStyle = "white";
    context.fillText(text, 512 - 8, 32);
  }

  public accelerate(): void {
    super.accelerate(this.jumping() ? 0.2 : 0.5);
  }

  public left(): void {
    if (this.speed > 1.75) {
      if (this.jumping()) {
        this.pos.x--;
      } else {
        this.pos.x -= Math.max(1.5, this.speed / 2);
      }
    }
  }

  public right(): void {
    if (this.speed > 1.75) {
      if (this.jumping()) {
        this.pos.x++;
      } else {
        this.pos.x += Math.max(1.5, this.speed / 2);
      }
    }
  }

  public brake(): void {
    super.brake(this.jumping() ? 0.35 : 0.75);
  }

  public step(): boolean {
    const result = super.step();
    if (this.jumping()) {
      const amplitude = 0.75 * this.duration / 96;  // TODO 96 constant...
      this.scale = 0.25 + amplitude * Math.sin(this.jumper * Math.PI / this.duration);
      if (--this.jumper === 0) {
        this.scale = 0.25;
        this.duration = -1;
      }
    } else {
      this.duration = 0;
    }
    if (this.health < 16 && this.frame % 20 === 0) {
      this.health++;
    }
    return result;
  }

  public justLanded(): boolean {
    return this.duration === -1;
  }

  public destroy(car: Car): void {
    this.score += car.value();
    car.explode();
  }

  public mask(): boolean[][] {
    return this.jumper === 0 ? super.mask() : undefined;
  }

  public increase(): void {
    if (this.energy < 96) {
      const step = Math.floor(Math.max(96 - this.energy, 1) / 8);
      this.energy += step > 0 ? step : 1;
    } else {
      this.energy = 96;
    }
  }

  public jump(): void {
    if (this.energy > 0 && !(this.crashes() || this.jumping())) {
      this.jumper = this.energy;
      this.duration = this.energy;
      this.energy = 0;
    }
  }

  public jumping(): boolean {
    return this.jumper > 0;
  }

  public currentScore(): number {
    return this.score;
  }

  protected slowDown(): void {
    if (!this.jumping()) {
      super.slowDown();
    }
  }

  protected offset(): number {
    return this.jumping() ? Math.round(this.width / 2 * this.scale) - 8 : 0;
  }

  protected preRender(context: CanvasRenderingContext2D): void {
    if (this.jumping()) {
      const size = Math.round(1.6 * this.width * (this.scale - 0.25));
      context.save();
      context.translate(2 + size, 2);
      context.globalAlpha = 1.1 - this.scale;
      context.fillStyle = "#343434";
      context.fillRect(3, 0, size - 6, size);
      context.restore();
    }
  }

}
