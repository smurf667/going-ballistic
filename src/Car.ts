import {Animation} from "./Animation";
import {Camera} from "./Camera";
import {Pair} from "./Pair";

export class Car {

  private static readonly NORMAL: Pair = new Pair(0, -1);
  private static COUNTER: number = 0;

  protected pos: Pair;
  protected dir: Pair;
  protected speed: number;
  protected scale: number;
  protected frame: number;
  protected health: number;
  protected readonly weight: number;

  private readonly identifier: number;
  private readonly anim: Animation;
  private readonly explosion: Animation;
  private readonly maxSpeed: number;
  private exploding: boolean;

  public constructor(
    animation: Animation,
    explosion: Animation,
    x: number,
    y: number,
    weight: number,
    speed: number,
    max: number,
  ) {
    this.identifier = Car.COUNTER++;
    this.pos = new Pair(x, y);
    this.dir = new Pair(0, -1);
    this.weight = weight;
    this.speed = speed;
    this.maxSpeed = max;
    this.scale = 1;
    this.anim = animation;
    this.explosion = explosion;
    this.frame = Math.round(Math.random() * 100);
    this.health = 16;
    this.exploding = false;
  }

  public id(): number {
    return this.identifier;
  }

  public position(): Pair {
    return this.pos;
  }

  public mask(): boolean[][] {
    return this.exploding ? undefined : this.anim.mask();
  }

  public explode(): void {
    if (this.exploding === false) {
      this.exploding = true;
    }
  }

  public value(): number {
    return this.weight * 100;
  }

  public crashes(): boolean {
    return this.exploding;
  }

  public normalize(): void {
    this.scale = 0.25;
  }

  public collide(other: Car): void {
    const middle = Math.min(other.pos.x, this.pos.x) + 0.5 * Math.abs(other.pos.x - this.pos.x);
    const factor = 2 * Math.sign(this.pos.x - middle);
    const forceMe = Math.max(0.5, this.speed / 4);
    const forceOther = Math.max(0.5, other.speed / 4);
    other.dir.add(new Pair(- factor * forceMe, -0.15 - forceMe).scale(this.weight / 4));
    this.dir.add(new Pair(factor * forceOther, -0.15 - forceOther).scale(other.weight / 4));
    if (--this.health === 0) {
      this.explode();
    }
    if (--other.health === 0) {
      other.explode();
    }
  }

  public left(): void {
    this.pos.x -= 3;
  }

  public right(): void {
    this.pos.x += 3;
  }

  public accelerate(factor?: number): void {
    if (this.speed < this.maxSpeed) {
      this.speed += !factor ? 0.5 : factor;
    }
  }

  public stop(): void {
    this.speed = 0;
  }

  public brake(factor?: number): void {
    this.speed -= !factor ? 0.75 : factor;
    this.speed = Math.max(this.speed, 1.1);
  }

  public steer(): void {
    const counter = this.identifier + this.frame;
    if (counter % 64 > 31) {
      if (Math.sin(counter * Math.PI / (32 + (this.identifier % 128))) < 0) {
        this.left();
      } else {
        this.right();
      }
    }
    if (counter % 128 > 96) {
      this.accelerate();
    }
  }

  public step(): boolean {
    this.frame++;
    this.dir.add(Car.NORMAL).scale(0.5); // TODO less?
    this.pos.add(new Pair(this.dir.x, this.dir.y).scale(this.speed));
    this.anim.step(); // TODO step in relation to speed
    if (this.exploding) {
      if (this.explosion.step() === true) {
        this.exploding = false;
        return true;
      }
      if (this.health > 0) {
        this.health = Math.floor(this.health / 2);
      }
      return false;
    }
    this.slowDown();
    return false;
  }

  public render(context: CanvasRenderingContext2D, camera: Camera): void {
    const camPos = camera.position();
    context.save();
    const o = this.offset();
    context.translate(this.pos.x - camPos.x - o, this.pos.y - camPos.y - o);
    this.preRender(context, o);
    if (this.exploding) {
      context.globalAlpha = 1.25 - this.explosion.complete();
    }
    this.anim.render(context, this.scale);
    if (this.exploding) {
      context.globalAlpha = 1;
      context.translate(-6, -6);
      this.explosion.render(context, 2);
    }
    context.restore();
  }

  protected slowDown(): void {
    if (this.speed > 3) {
      this.speed -= 0.25;
    }
  }

  protected preRender(context: CanvasRenderingContext2D, offset: number): void {
    // implemented by sub-classes
  }

  protected offset(): number {
    return 0;
  }

}
