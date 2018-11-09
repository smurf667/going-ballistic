import {Animation} from "./Animation";
import {Car} from "./Car";
import {Player} from "./Player";

interface CarData {
  id?: string;
  weight: number;
  probability: number;
  maxSpeed: number;
}

export class Resources {

  public static readonly AMBULANCE = "ambulance";
  public static readonly CLEANER = "cleaner";
  public static readonly EXPLOSION = "explosion";
  public static readonly PLAYER = "player";
  public static readonly RACER = "racer";
  public static readonly SKINNY = "skinny";
  public static readonly SKULL = "skull";
  public static readonly TANK = "tank";
  public static readonly TAXI = "taxi";

  private static readonly ELEMENTS = "elements";
  private static readonly TILES = "tiles";
  private static readonly RANDOM_CARS = "carDist";
  private static readonly CAR_NAMES = "carNames";

  private resources: Map<any, any>;
  private carData: Map<string, CarData>;

  public constructor() {
    this.resources = new Map();
    this.carData = new Map();
    this.carData.set(Resources.AMBULANCE, { weight: 3, probability: 2, maxSpeed: 6 });
    this.carData.set(Resources.CLEANER, { weight: 7, probability: 2, maxSpeed: 3 });
    this.carData.set(Resources.PLAYER, { weight: 3, probability: 0, maxSpeed: 8 });
    this.carData.set(Resources.RACER, { weight: 2, probability: 3, maxSpeed: 7 });
    this.carData.set(Resources.SKINNY, { weight: 1, probability: 5, maxSpeed: 4.5 });
    this.carData.set(Resources.SKULL, { weight: 5, probability: 2, maxSpeed: 5 });
    this.carData.set(Resources.TANK, { weight: 10, probability: 1, maxSpeed: 2.5 });
    this.carData.set(Resources.TAXI, { weight: 4, probability: 3, maxSpeed: 4 });
    this.carData[Resources.RANDOM_CARS] = this.buildCarDistribution();
    const names: string[] = [...this.carData.entries()]
      .sort( (a, b) => a[1].weight - b[1].weight )
      .map( (e) => e[0] );
    this.resources.set(Resources.CAR_NAMES, names);
  }

  public tile(index: number): HTMLCanvasElement {
    return this.resources.get(index) as HTMLCanvasElement;
  }

  public tileMask(index: number): boolean[][] {
    return this.resources.get((index + 1) * 256) as boolean[][];
  }

  public tileValue(index: number): number {
    return this.resources.get((index + 1) * 65536) as number;
  }

  public carNames(): string[] {
    return this.resources.get(Resources.CAR_NAMES);
  }

  public car(x: number, y: number, name?: string): Car {
    if (name) {
      const data = this.carData.get(name);
      return new Car(
        this.animation(name),
        this.animation(Resources.EXPLOSION),
        x,
        y,
        data.weight,
        1 + data.maxSpeed * Math.random(),
        data.maxSpeed,
      );
    }
    const list = this.carData[Resources.RANDOM_CARS] as string[];
    return this.car(x, y, list[Math.floor(Math.random() * list.length)]);
  }

  public player(x: number, y: number, score: number): Player {
    const data = this.carData.get(Resources.PLAYER);
    return new Player(
      this.animation(Resources.PLAYER),
      this.animation(Resources.EXPLOSION),
      x,
      y,
      data.weight,
      2.5,
      data.maxSpeed,
      score,
    );
  }

  public init(): Promise<any> {
    return Promise.all([
      this.load(Resources.TILES, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAMAAAA8G4RnAAAAY1BMVEX0AQAyUposXMU0X78oZdosbuYldOdDdNMqlSgzf+t5e3hYf8s1h+0soyk5kfAkuSGNj4xRl+4zszNplN6omBWXmZawnxIryyu4pQyLpNu+rBOGqOppsPRJ4EalxPPU1tPK2vnoTbqhAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAPgSURBVFjDxZhrd6IwFEUlL0gFNNWAL6j//1fOCW+PimvNdOC2jWhXP+x1bm6yu/Ef6udrv5mrnw+1+fDXZVImVVUlVRKqTNqqkr6k1lpIrFILISIRhZLGhG8po+jYVoEKa3i+FO1r8/nmnwG/5usD31eA6fGSXTICVi2wNjog6jQNbKAMq1QagHi2ppgC9nX5VcD9bH3g2ydlgKke8LJqjFAbY601tgFEhsLkAJRKBG5AniZcx9MFpKcp668Abv6yAt++acuq58nC8p1MSoce1RqQCoAqAOYxCAGoQrqAGULsXoclrCsCNnye91xLuNt1sIkxTYciRBUphUdlcitzJwQAAT4BKwbK4hiCbR7XA2z5/IRq6NHduAkTDBjEhbyMil2KyaJMmudpnDstBdIdQztOgxy6dDXAjs8nz7VrSLM2wsCHYYmstte6rs9bDcI0dahmuE6Y2tfLpRjwTqfVAHu+AfB7NwzOPs8m0DArMVNUfDjXh219vx+cy1NrXa5S9Kp5AgxrcVobcOBjwHacNmhVFt4JCUBhEN8BsyW+3u91m2AqUhdLMWUbJ2qx8hQd+QbAMtmNh8OuybDq9qAQKj5fD1ajJc3hfr/mIMRGRJMKQSP0oRDkOoATPt8T4ezLJvswazFLAGJ42vPVWQDivDc3EDpp4u0ZIQrRxVY0x0VxvAy8HfIagFO+PsEsK8vxOGybNnRtAJTKncFnZYr7jNHI8F5f6+s11jgWC+yz0JHd5eURENgrAD7w+S4vfJXtDizbYzHrDnzcP5XKz+hJRIjGxLGYbm/3unaxUioSR9p23KvLAz7y+fECM6mqSxW/ECKMUAk2C8Tm5+Zut5vDQd8BdlkVj9fQYiVA4nu+yZTj26xpURW8IdI2TJbUWH1z7qadwzVGyUhc+mYco7y0l9J1AJnv+aAHYDncY8KQ0eALjLh0G4CGt7Zxp6boHjMCdv26MOAT31OC7Ifsf+yH7H/sh8sCPvN59j/2Q/Y/9kP2P/bDRQFf8Hn2P/ZD9j/2Q/Y/9sMlAV/xefY/9kP2P/ZD9j/2wwUBX/J59j/ek+x/7Ifsf+yHywG+5vPsf+yH7H/sh+x/7IeLAb7h8+x/XOx/7Ifsf6xPSwG+4/Psf+yH7H/sh+x/KwG+5fPsf+yH7H/sh+x/7IfLAL7n8+x/7Ifsf+yH7H98514EcIbPs/+xH7L/sR+y/7EfLgE4x+fZ/9gP2f/YD9n/2A8XAJzl8+x/7Ifsf+yHL/9XsaguzfN59j/2Q/Y/9kP2P/bD/w74gc+z//FNhv2P/ZD9j/3w/wPO83n2Py72P/ZD9j/2wz+JnDYsmT0ATQAAAABJRU5ErkJggg==")
      .then(() => this.assembleTiles() ),
      this.load(Resources.PLAYER, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAG1BMVEWebhQAAAA1LHqJKRs9PT1PUhVeTtqa0XrX3zkLyslAAAAAAXRSTlMAQObYZgAAAjZJREFUaN7tmVGOgjAQhhtvYOIBjNl4AR58dtPICYjvxnABMVyBYy+lUPq3f+uDjposTTYRv9nZb+qAw6KUWTu6lFvSfMUDtu/ialfTtXsX/6zA8Kr/adv2fq/MUXU+9wfj27U09wXaygZULU8gwoMd2Nf1JVfB63mwA0NApoLXc6XXer03R8MyAfZV/9bFsOPmuElxw/oQneKG9SHHFDdMTQFkDQGTIOO+IOO+IOOGqUcB0oLq2QqeFXQ9QE4TqIBxX5BxX5Bx6AFyoYAKGA8EIx4IRhx6gJwmpALkgWDE4x1EDj1ALhSkAuSBYMTjHUQOPbBcB/7vdWCZB5Z5YAqwZ+eP1r/uPIUEUtwJmHXVwzp5v1dLcxDQ40olkOBfJWBY284RYQIR7glcBz5EnFgCGe4J6DlAswQyHAVKE9CkEwjwWWDicwQmEOJO4IoBpzCBFHcC0yfkfUqQQIp/XmAaGEgATDSM+wML4/7AwjjMhKkAaUH1bAXPCirpLX4k+G09cCuKQ64C5LEg8lgQ+Vf2wO2Q32LgRBA4EQTOeqDo8hUURV4QOBHsikc90Mn2QJftgdImaFIVlFawSQmW9g80KcEwf9QDpd3CJlVBaT+ijOCwxRlBzA/3hnrco3GH6JeJBId5YJ5Y+Pe5BEcBN7MlEghwGMnc2JwYqSR4MJZr/+aJjNWv5/6NyRV5dGMhwr/r3rAGHieQ4MtTs0XAPlql/0m8bN/F1Yoq+s9+Zfnnn57ziPfwP1aWDfef0yoMAAAAAElFTkSuQmCC")
      .then(() => this.assemblePlayer() ),
      this.load(Resources.ELEMENTS, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXAAAAAQCAMAAAA4RNTjAAAAUVBMVEUAAAAAAABCI1KJKRs9PT1iNXpSThdPUhVNTU2JQDZeTtqtVg+UULh6dAt2eh9ihU3fgBSjmg+jo6PFshLftBTPuhPMyROa0XrX3znf7BT////hOBS4AAAAAXRSTlMAQObYZgAABCRJREFUWMPFmIt2mzAQRMG4xCmRjSgWcf//Q7tP7UoG27RpuycBBjUOvWxGIzUNVQvVSH260nt+nOpyaR7q4/FF/Q3qdDodDnDA6w8o1R9Spe664vux/Khl8/+rdcW4z+e3z8+385mRT9NPqWnSn+mg/GcUum2Px8sFkdJbgoNolaJJMkIEijwUqWl8Car5hfxr4CEEOX8hbsSp0H2H65iW9HnXlcRLDcDbZYFDK4RNyy9UvQL8HnD9Qv428BijnJkz6MDnoDdIB9FN2A3ccDJw6/A82nUeuLcQvsWar3cBZ8AHKA+YtXW86XWL26uLSsmf4u2WIp3p1IQEFwEwz4lBz+OMA2G8ih6Y+CAf1/c9nx8Bl6/tDjfgNeBt4M5SWJul1B2+Dbh+IfAj33Pxf6HQ8KFOE+hCE9rGjnhxS/lIwIFwxJMCJz3PMwNO40y8x5H1wMCHgYn3IfR87vUFNP4F1B1eeziNsmUo8OUitTDwUtOUKMDzFLmtEeqBgR4UsGrteD/etgCOnwcu8In3afqlN/k24kl5U4cn+hZLgZGQ4It5Q0fPiLu5jrHw9qs0eg14rce9Q3Nn4/NpTvHA6Z8j267DIwMv9U7gzwCvAe86JchAvcaGN81/AKVmwgVvrNzwkXW+EVJACaeswzgDccdwGIeCad+/4OKWUoD3+SzECXi2FLEEBqwWYvoFwM86/FnHewdRoPu0MG62iTNw6XA2FWx5nSShv8FfRhdbBvCXgneoiBeqBdSQ+PAowJG3Er8DzoCxfAov9W7gVA4wa+t4GxeEZBD6cXs1+InhVeJ2Q4AniSlNyDoY8HEMMb8R4D0U/R1Cv93xCJqzITuEB453fCzUGEgu4mJhpXdbCk2VDjBr63jTZhIe6D4N/n3b5s2ekmLO4ZHnTZfHAbDpVUfpH+dw9JMcxEvgZDcTlc/haCIWC1VranEp5C6lVClGgL6/l4CzlhdCWlLKHwO/nzNzRtFcmLKjQB6EQJh0zgQN9hFT0DmziSXspn9pnWnrnhXgE/9JTzkW1oBLXeTsuxxe5XRZyiBQFwNZWy638WdAbdpEzfOS11s53KcUYB1zj0MqgVkSj5JSxvHaeI3tHSAc/sj+XfZ4vzplyoFjYceTZqexsAK+LKwXjYWV3gVcABNWBzgfa00xTwDm2LdDby9/zFAiYdcFJ1kHABYLD6zBw9XROY2Pwft1X5m4YffNjVd1LLxb2j8HvttSNLYZYNP8Qrjwum0RHQPsOnzqffqVpb1f4IvWBX4GHG1BT1exedFYGDU+kN++8ruF6OE4MuUcvkhpDi807wXy5pXtDW5q2g1knicFrDrvHrpxeFbrWAa6S7+85xHXt7C+pLSD1rdnJ9tMnPLyfVlsKW/697dnqdz2LJXbns2aLUJLLcP0azn8/9UvLnSFpM6b2FIAAAAASUVORK5CYII=")
      .then(() => this.assembleElements() ),
    ]);
  }

  protected load(key: string, tilesURI: string): Promise<HTMLImageElement> {
    const img = new Image();
    const result = new Promise<HTMLImageElement>(function(resolve, reject) {
      img.onload = function() {
        this.resources.set(key, img);
        resolve(img);
      }.bind(this);
      img.onerror = () => reject("Could not load image: " + tilesURI);
    }.bind(this));
    img.src = tilesURI;
    return result;
  }

  protected assembleTiles(): Promise<any> {
    return new Promise(function(resolve, reject) {
      const raw: HTMLImageElement = this.resources.get(Resources.TILES);
      const tiles: HTMLCanvasElement[] = [];
      [0, 4, 5, 6].forEach((idx) => {
        const canvas = this.newCanvas(32, 32);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(raw, idx * 32, 0, 32, 32, 0, 0, 32, 32);
        tiles.push(canvas);
      });
      const baseTypes = [1, 2, 3];
      baseTypes.forEach((idx) => {
        baseTypes.forEach((base) => {
          for (let rot = 0; rot < 4; rot++) {
            const canvas = this.newCanvas(32, 32);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(tiles[idx], 0, 0, 32, 32);
            ctx.save();
            if (rot > 0) {
              ctx.translate(16, 16);
              ctx.rotate(rot * Math.PI / 2);
              ctx.translate(-16, -16);
            }
            ctx.drawImage(raw, base * 32, 0, 32, 32, 0, 0, 32, 32);
            ctx.restore();
            tiles.push(canvas);
          }
        });
      });
      const road: Uint8ClampedArray = Uint8ClampedArray.of(151, 153, 150, 255);
      const counter: number[] = [ 0 ];
      for (let i = 0; i < tiles.length; i++) {
        this.resources.set(i, tiles[i]);
        counter[0] = 0;
        this.resources.set((i + 1) * 256, this.mask(tiles[i], counter, road));
        this.resources.set((i + 1) * 65536, counter[0]);
      }
      this.resources.delete(Resources.TILES);
      resolve();
    }.bind(this));
  }

  protected assembleAnimation(
    source: HTMLImageElement,
    offset: number,
    width: number,
    c: number,
    sequence?: number[]): Animation {
    const frames: HTMLCanvasElement[] = [];
    const masks: boolean[][][] = [];
    for (let idx = 0; idx < c; idx++) {
      const canvas = this.newCanvas(width, source.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(source, offset + idx * width, 0, width, source.height, 0, 0, width, source.height);
      frames.push(canvas);
      masks.push(this.mask(canvas));
    }
    if (sequence) {
      const seqFrames: HTMLCanvasElement[] = [];
      const seqMasks: boolean[][][] = [];
      sequence.forEach( (idx) => {
        seqFrames.push(frames[idx]);
        seqMasks.push(masks[idx]);
      });
      return new Animation(seqFrames, seqMasks);
    }
    return new Animation(frames, masks);
  }

  protected assemblePlayer(): Promise<any> {
    return new Promise(function(resolve, reject) {
      this.resources.set(Resources.PLAYER, this.assembleAnimation(this.resources.get(Resources.PLAYER), 0, 64, 4));
      resolve();
    }.bind(this));
  }

  protected assembleElements(): Promise<any> {
    return new Promise(function(resolve, reject) {
      const elements: HTMLCanvasElement = this.resources.get(Resources.ELEMENTS);
      this.resources.delete(Resources.ELEMENTS);
      this.resources.set(Resources.SKULL, this.assembleAnimation(elements, 0, 16, 1));
      this.resources.set(Resources.TAXI, this.assembleAnimation(elements, 16, 16, 1));
      this.resources.set(Resources.AMBULANCE, this.assembleAnimation(elements, 32, 16, 1));
      this.resources.set(Resources.RACER, this.assembleAnimation(elements, 48, 16, 2));
      this.resources.set(Resources.SKINNY, this.assembleAnimation(elements, 80, 16, 3));
      this.resources.set(Resources.TANK, this.assembleAnimation(elements, 128, 16, 3));
      this.resources.set(Resources.CLEANER, this.assembleAnimation(elements, 176, 16, 4));
      this.resources.set(Resources.EXPLOSION, this.assembleAnimation(elements, 240, 16, 8));
      resolve();
    }.bind(this));
  }

  protected animation(name: string): Animation {
    return this.resources.get(name) as Animation;
  }

  protected mask(source: HTMLCanvasElement, counter?: number[], value?: Uint8ClampedArray): boolean[][] {
    const ctx = source.getContext("2d");
    const data = ctx.getImageData(0, 0, source.width, source.height).data;
    const result: boolean[][] = [];
    let obstacle: boolean;
    for (let y = 0; y < source.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < source.width; x++) {
        const idx = y * (source.width * 4) + x * 4;
        if (value) {
          let i = 0;
          for (; i < value.length; i++) {
            if (data[idx + i] !== value[i]) {
              break;
            }
          }
          // any non-matching pixel is an obstacle
          obstacle = i < value.length;
        } else {
          // non-transparent pixels are obstacles
          obstacle = data[idx + 3] === 255;
        }
        if (counter && obstacle) {
          counter[0]++;
        }
        row.push(obstacle);
      }
      result.push(row);
    }
    return result;
  }

  protected newCanvas(width, height): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  protected buildCarDistribution(): string[] { // TODO fixme
    const result: string[] = [];
    this.carData.forEach((data, name) => {
      data.id = name;
      if (data.probability > 0) {
        const repeat: string[] = new Array(data.probability).fill(name);
        result.push(...repeat);
      }
    });
    return result;
  }

}
