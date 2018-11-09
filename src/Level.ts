import {Camera} from "./Camera";
import {Car} from "./Car";
import {Pair} from "./Pair";
import {Resources} from "./Resources";

export class Level {

  private resources: Resources;
  private level: number[][];
  private backup: number[][];
  private highlight: Pair;

  public constructor(resources: Resources, width?: number, height?: number) {
    this.resources = resources;
    if (width) {
      this.level = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          row.push(1); // green, green grass everywhere
        }
        this.level.push(row);
      }
    }
    this.highlight = new Pair(-1, -1);
  }

  public width(): number {
    return this.level[0].length;
  }

  public height(): number {
    return this.level.length;
  }

  public tile(x: number, y: number, index?: number, std?: number): number {
    if (y >= 0 && y < this.level.length) {
      if (x >= 0 && x < this.level[y].length) {
        if (typeof index === "number") {
          this.level[y][x] = index;
        }
        return this.level[y][x];
      }
    }
    return std ? std : 0;
  }

  public collides(car: Car): boolean {
    const mask = car.mask();
    if (!mask) {
      return false;
    }
    const pos = car.position();
    const sx = Math.round(pos.x);
    if (sx < 0) {
      return false;
    }
    const sy = Math.round(pos.y);
    if (sy < 0) {
      return false;
    }
    const yPositions: number[] = [];
    const ey = sy + 3;
    for (let y = sy; y < ey; y++) {
      yPositions.push(y);
    }
    yPositions.push(sy + Math.floor(mask.length / 2));
    yPositions.push(sy + mask.length - 2);
    yPositions.push(sy + mask.length - 1);
    const ex = sx + mask[0].length;
    for (const y of yPositions) {
      const ty = Math.floor(y / 32) % this.height();
      let last = -1;
      let ground;
      for (let x = sx; x < ex; x++) {
        const tx = Math.floor(x / 32) % this.level[0].length;
        if (tx !== last) {
          ground = this.resources.tileMask(this.level[ty][tx]);
          last = tx;
        }
        if (ground[y % 32][x % 32] && mask[y - sy][x - sx]) {
          return true;
        }
      }
    }
    return false;
  }

  public tiles(img: HTMLImageElement, canvas: HTMLCanvasElement): void {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const newTiles: number[][] = [];
    for (let y = 0; y < canvas.height; y++) {
      const row = [];
      for (let x = 0; x < canvas.width; x++) {
        row.push(ctx.getImageData(x, y, 1, 1).data[0]);
      }
      newTiles.push(row);
    }
    this.level = newTiles;
  }

  public cloneRow(y: number, ty: number): boolean {
    if (y >= 0) {
      this.save();
      if (ty === -1) { // insert new row
        this.level.unshift(this.level[0].slice());
      } else if (ty === this.level.length) {
        this.level.push(this.level[y].slice());
      } else {
        this.level[ty] = this.level[y].slice();
      }
      return true;
    }
    return false;
  }

  public cloneColumn(x: number, tx: number): boolean {
    if (x >= 0) {
      this.save();
      for (const row of this.level) {
        if (tx === -1) { // insert new column
          row.unshift(row[x]);
        } else if (tx === this.level[0].length) {
          row.push(row[x]);
        } else {
          row[tx] = row[x];
        }
      }
      return true;
    }
    return false;
  }

  public fill(x: number, y: number, tile: number): boolean {
    const old = this.tile(x, y);
    if (old === tile) {
      return false;
    }
    this.save();
    const stack: Pair[] = [ new Pair(x, y) ];
    while (stack.length > 0) {
      const pos = stack.pop();
      this.tile(pos.x, pos.y, tile);
      if (this.tile(pos.x - 1, pos.y, undefined, -1) === old) {
        stack.push(new Pair(pos.x - 1, pos.y));
      }
      if (this.tile(pos.x + 1, pos.y, undefined, -1) === old) {
        stack.push(new Pair(pos.x + 1, pos.y));
      }
      if (this.tile(pos.x, pos.y - 1, undefined, -1) === old) {
        stack.push(new Pair(pos.x, pos.y - 1));
      }
      if (this.tile(pos.x, pos.y + 1, undefined, -1) === old) {
        stack.push(new Pair(pos.x, pos.y + 1));
      }
    }
    return true;
  }

  public save() {
    this.backup = this.level.slice();
    for (let i = 0; i < this.backup.length; i++) {
      this.backup[i] = this.backup[i].slice();
    }
  }

  public restore(): boolean {
    if (this.backup) {
      this.level = this.backup;
      this.backup = undefined;
      return true;
    }
    return false;
  }

  public render(canvas: HTMLCanvasElement, camera?: Camera): CanvasRenderingContext2D {
    const viewport = canvas.getContext("2d");
    if (camera) {
      const pos = camera.position();
      const moduloX = this.level[0].length;
      const moduloY = this.level.length;
      const offsetX = - pos.x % 32;
      const sx = Math.floor(pos.x / 32);
      let offsetY = - (pos.y % 32);
      // tile row to start
      let y = Math.floor(pos.y / 32);
      const maxY = y + 1 + Math.ceil(canvas.height / 32);
      const maxX = 1 + Math.ceil(canvas.width / 32);
      for (; y < maxY; y++) {
        for (let x = 0; x < maxX; x++) {
          viewport.drawImage(this.resources.tile(this.level[y % moduloY][(sx + x) % moduloX]),
            x * 32 + offsetX,
            offsetY,
          );
        }
        offsetY += 32;
      }
    } else {
      // size the canvas to the whole level and render everything
      const w = this.level[0].length;
      canvas.width = w * 32;
      canvas.height = this.level.length * 32;
      for (let y = 0; y < this.level.length; y++) {
        const oy = y * 32;
        for (let x = 0; x < w; x++) {
          viewport.drawImage(this.resources.tile(this.level[y][x]), x * 32, oy);
        }
      }
      if (this.highlight.x >= 0) {
        viewport.save();
        viewport.lineWidth = 1;
        viewport.strokeStyle = "black";
        const x  = 0.5 + this.highlight.x * 32;
        const y  = 0.5 + this.highlight.y * 32;
        viewport.beginPath();
        viewport.moveTo(x + 16, 0);
        viewport.lineTo(x + 16, y);
        viewport.stroke();
        viewport.beginPath();
        viewport.moveTo(0, y + 16);
        viewport.lineTo(x, y + 16);
        viewport.stroke();
        viewport.strokeRect(x, y, 32, 32);
        viewport.restore();
      }
    }
    return viewport;
  }

  /**
   * Returns an image previewing the level.
   */
  public preview(document: HTMLDocument): string {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const pixels = [
      this.pixel(ctx, 151, 153, 150),
      this.pixel(ctx, 0, 224, 0),
      this.pixel(ctx, 0, 0, 244),
      this.pixel(ctx, 192, 192, 0),
    ];
    canvas.height = this.height();
    canvas.width = this.width();
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        let idx = this.tile(x, y);
        if (idx > 3) {
          idx = 1 + Math.floor( (idx - 4) / 12 );
        }
        ctx.putImageData(pixels[idx], x, y);
      }
    }
    return canvas.toDataURL();
  }

  public renderGameOver(context: CanvasRenderingContext2D): void {
    this.renderText(context, "GAME OVER", "black", "red");
  }

  public renderNextLevel(context: CanvasRenderingContext2D): void {
    this.renderText(context, "NEXT LEVEL", "white", "blue");
  }

  public renderCountDown(num: number, canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d");
    context.save();
    context.font = "bold 64px Sans-serif";
    context.textAlign = "center";
    context.shadowBlur = 10;
    context.shadowColor = "black";
    context.fillStyle = "yellow";
    context.fillText(num.toString(), 384 - (64 * num), 256 + 96);
    context.restore();
  }

  public mouse(x: number, y?: number): boolean {
    if (x < 0) {
      this.highlight.x = -1;
      this.highlight.y = -1;
      return true;
    } else if (y) {
      const nx = Math.floor(x / 32);
      const ny = Math.floor(y / 32);
      if (this.highlight.x !== nx || this.highlight.y !== ny) {
        this.highlight.x = nx;
        this.highlight.y = ny;
        return true;
      }
    }
    return false;
  }

  private pixel(context: CanvasRenderingContext2D, r: number, g: number, b: number): ImageData {
    const pixel = context.createImageData(1, 1);
    pixel.data.fill(255, 3, 4);
    pixel.data[0] = r;
    pixel.data[1] = g;
    pixel.data[2] = b;
    return pixel;
  }

  private renderText(context: CanvasRenderingContext2D, text: string, strokeStyle: string, fillStyle: string): void {
    context.save();
    context.font = "bold 64px Sans-serif";
    context.textAlign = "center";
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.lineWidth = 2;
    context.shadowColor = "yellow";
    context.shadowBlur = 10;
    context.fillText(text, 256, 256 + 16);
    context.strokeText(text, 256, 256 + 16);
    context.restore();
  }

}
