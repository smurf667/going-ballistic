import {Pair} from "./Pair";
import {Player} from "./Player";

export class Camera {

  private pos: Pair;
  private width: number;
  private height: number;
  private max: number;

  public constructor(x: number, y: number, width: number, height: number, levelWidth: number) {
    this.pos = new Pair(x, y);
    this.width = width / 2;
    this.height = height / 2;
    this.max = levelWidth - width;
  }

  public position(): Pair {
    return this.pos;
  }

  public update(player: Player): void {
    const playerPos = player.position();
    this.pos.x = Math.min(Math.max(playerPos.x - this.width, 0), this.max);
    this.pos.y = Math.max(playerPos.y - this.height, 0);
  }

}
