import {Camera} from "./Camera";
import {Car} from "./Car";
import {Editor} from "./Editor";
import {Level} from "./Level";
import {Pair} from "./Pair";
import {Player} from "./Player";
import {Resources} from "./Resources";

export class Game {

  private static readonly DOWN = "ArrowDown";
  private static readonly EDITOR = "Editor";
  private static readonly LEFT = "ArrowLeft";
  private static readonly RIGHT = "ArrowRight";
  private static readonly SPACE = " ";
  private static readonly SPACE_UP = "SpaceUp";
  private static readonly UP = "ArrowUp";

  protected keys: Map<string, boolean>;

  private resources: Resources;
  private editor: Editor;
  private document: HTMLDocument;
  private window: Window;
  private panel: HTMLElement;
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private time: number;
  private highscore: number;
  private level: Level;
  private player: Player;
  private cars: Car[];
  private levels: Level[];
  private stage: number;
  private introFrame: number;

  public constructor(window: Window) {
    this.window = window;
    this.levels = [];
    this.document = window.document;
    this.keys = new Map();
    this.stage = 0;
    this.highscore = 0;
    this.introFrame = 0;
  }

  public init(levelData: HTMLImageElement[]): Promise<any> {
    this.resources = new Resources();
    return this.resources.init().then(() => {
      this.levels = levelData.map( (data) => this.createLevel(data) );
    });
  }

  public showEditor(): void {
    if (!this.editor) {
      this.editor = new Editor(
        this.resources,
        this.document,
        this.level ? this.level : new Level(this.resources, 16, 64),
        this.levels,
      );
      if (this.canvas) {
        this.canvas.style.display = "none";
      }
    } else {
      this.editor.setLevel(this.level ? this.level : this.levels[this.stage]);
    }
  }

  public play(level: Level): void {
    const game = this;
    const canvasSize = 512;
    this.panel.focus();
    this.level = level;
    this.camera = new Camera(0, level.height() * 32 - (canvasSize / 2), canvasSize, canvasSize, level.width() * 32);
    this.player = this.resources.player(0, this.camera.position().y, this.player ? this.player.currentScore() : 0);
    this.place(this.player);
    this.cars = [];

    const stepper = (timestamp: number) => {
      if (game.gameStep(timestamp)) {
        this.window.requestAnimationFrame(stepper);
      } else {
        game.countDown();
      }
    };
    this.window.requestAnimationFrame(stepper);
  }

  public intro(): void {
    const game = this;
    const canvasSize = 512;
    this.keys.clear();
    // little hack: the hash can be a numeric value; playing will start at the given level
    this.stage = window.location.hash ? parseInt(window.location.hash.substring(1), 10) % this.levels.length : 0;
    this.player = this.resources.player(0, 0, 0);
    if (!this.panel) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("style",
      "position: fixed; width: 100%; height: 100%; left: 0; top: 0; z-index: -1; filter: blur(2px);");
      const children = document.body.children;
      for (const child of children) {
        wrapper.appendChild(child);
      }
      const old = document.body;
      while (old.firstChild) {
        old.removeChild(old.firstChild);
      }
      document.body.appendChild(wrapper);
      this.panel = document.createElement("div");
      this.panel.setAttribute("id", "panel");
      this.panel.setAttribute("tabindex", "0");
      this.panel.setAttribute("style",
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: blur(0px); z-index: 16;");
      const keyHandler = (event) => {
        game.keys.set(event.key, event.type === "keydown");
        if (event.key === Game.SPACE) {
          game.keys.set(Game.SPACE_UP, event.type === "keyup");
        } else if (event.shiftKey && event.key === "E") {
          game.keys.set(Game.EDITOR, event.type === "keydown");
        }
      };
      this.panel.onkeyup = keyHandler;
      this.panel.onkeydown = keyHandler;
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("width", canvasSize.toString());
      this.canvas.setAttribute("height", canvasSize.toString());
      this.panel.appendChild(this.canvas);
      document.body.appendChild(this.panel);
    }
    this.panel.focus();
    this.camera = new Camera(0, 0, 0, 0, 0);
    this.cars = [];
    let i: number = 0;
    for (const name of this.resources.carNames()) {
      const car = this.resources.car(176 * (i % 2), 48 * Math.floor(i / 2), name);
      car.stop();
      if (name === Resources.PLAYER) {
        car.normalize();
      }
      this.cars.push(car);
      i++;
    }
    this.level = this.levels[Math.floor((Math.random() * this.levels.length))];
    const stepper = (timestamp: number) => {
      if (game.introStep(timestamp)) {
        this.window.requestAnimationFrame(stepper);
      } else {
        this.play(this.levels[this.stage]);
      }
    };
    this.window.requestAnimationFrame(stepper);
  }

  protected next(): void {
    this.stage = (this.stage + 1) % this.levels.length;
    this.play(this.levels[this.stage]);
  }

  protected countDown(): void {
    const game = this;
    this.level.renderCountDown(3, game.canvas);
    this.window.setTimeout( () => {
      game.level.renderCountDown(2, game.canvas);
    }, 1000);
    this.window.setTimeout( () => {
      game.level.renderCountDown(1, game.canvas);
    }, 2000);
    if (!this.editor) {
      if (game.camera.position().y <= 0) {
        this.window.setTimeout( () => {
          game.next();
        }, 3000);
      } else {
        this.highscore = Math.max(this.highscore, this.player.currentScore());
        this.window.setTimeout( () => {
          game.intro();
        }, 3000);
      }
    }
  }

  protected createLevel(levelData: HTMLImageElement): Level {
    const result = new Level(this.resources);
    result.tiles(levelData, document.createElement("canvas") as HTMLCanvasElement);
    return result;
  }

  protected introStep(timestamp?: number): boolean {
    if (this.editor) {
      return false;
    }
    if (!this.time) {
      this.time = timestamp;
    }
    const camPos = this.camera.position();
    const amplitude = (this.level.width() * 32 - 512) / 2;
    const speed = Math.max(Math.PI / (2 * 180), Math.PI / (this.level.height() * 2));
    const delta = Math.min((timestamp - this.time), 250);
    if (delta >= 40 && this.keys.size === 0) {
      this.introFrame++;
      camPos.x = amplitude + amplitude * Math.cos(this.introFrame * speed);
      camPos.y--;
      if (camPos.y < 0) {
        camPos.y = this.level.height() * 32 - 512;
      }
      const viewport = this.level.render(this.canvas, this.camera);
      viewport.save();
      const fixed = new Camera(0, 0, 0, 0, 0);
      const outline = viewport.createLinearGradient(128, 0, 512 - 128, 48);
      outline.addColorStop(0, "yellow");
      outline.addColorStop(1, "red");
      const inner = viewport.createLinearGradient(0, 96, 0, 176);
      inner.addColorStop(0, "white");
      inner.addColorStop(1, "black");
      viewport.font = "bold 64px Sans-serif";
      viewport.textAlign = "center";
      viewport.strokeStyle = outline;
      viewport.fillStyle = inner;
      viewport.lineWidth = 2;
      viewport.fillText("GOING", 256, 112);
      viewport.fillText("BALLISTIC", 256, 112 + 64);
      viewport.shadowColor = "black";
      viewport.shadowBlur = 8;
      viewport.shadowOffsetX = 8;
      viewport.shadowOffsetY = 8;
      viewport.strokeText("GOING", 256, 112);
      viewport.strokeText("BALLISTIC", 256, 112 + 64);
      viewport.shadowBlur = 0;
      viewport.shadowOffsetX = 0;
      viewport.shadowOffsetY = 0;
      viewport.translate(128, 224);
      viewport.font = "16px Sans-serif";
      viewport.textAlign = "left";
      viewport.fillStyle = "white";
      for (const car of this.cars) {
        car.render(viewport, fixed);
        const pos = car.position();
        viewport.fillText(car.value().toString(), pos.x + 32, pos.y + 12);
        if (this.introFrame % 7 === 0) {
          car.step();
        }
      }
      viewport.textAlign = "center";
      viewport.fillText("highscore " + this.highscore, 128, 256);
      if (this.introFrame % 64 < 32) {
        viewport.fillStyle = "black";
      }
      viewport.fillText("press any key to start", 128, 224);
      viewport.restore();
    }
    return this.keys.size === 0;
  }

  protected gameStep(timestamp?: number): boolean {
    if (this.keys.get(Game.EDITOR)) {
      this.showEditor();
      return false;
    }
    if (!this.time) {
      this.time = timestamp;
    }
    const camPos = this.camera.position();
    const delta = Math.min((timestamp - this.time), 250);
    if (delta >= 40 && camPos.y > 0) {
      this.time = timestamp;
      this.camera.update(this.player);

      // ensures that always at least 4 cars are around
      const playerPos = this.player.position();
      let attempts = 4;
      while (this.cars.length < 4 && attempts > 0) {
        const car = this.resources.car(0, playerPos.y + Math.floor(128 * Math.random()) - 100);
        if (this.place(car, playerPos.x)) {
          this.cars.push(car);
        } else {
          attempts--;
        }
      }

      const context = this.level.render(this.canvas, this.camera);
      const activeFlags = this.moveCars();
      const playerActive = !this.player.step();

      // render all cars
      for (let idx = this.cars.length - 1; idx >= 0; idx--) {
        const car = this.cars[idx];
        car.render(context, this.camera);
        const carPos = car.position();
        if (activeFlags[idx] && Math.abs(playerPos.y - carPos.y) < 320) {
          if (this.level.collides(car)) {
            car.explode();
          }
        } else {
          this.cars.splice(idx, 1);
        }
      }

      // render player
      this.player.render(context, this.camera);

      if (playerActive) {
        if (this.level.collides(this.player)) {
          this.player.explode();
        } else {
          if (this.keys.get(Game.LEFT)) {
            this.player.left();
          } else if (this.keys.get(Game.RIGHT)) {
            this.player.right();
          }
          if (this.keys.get(Game.UP)) {
            this.player.accelerate();
          } else if (this.keys.get(Game.DOWN)) {
            this.player.brake();
          }
          if (this.keys.get(Game.SPACE)) {
            this.player.increase();
          } else if (this.keys.get(Game.SPACE_UP)) {
            this.keys.set(Game.SPACE_UP, false);
            this.player.jump();
          }
          this.carCollisions();
        }
      } else {
        this.level.renderGameOver(context);
        return false;
      }
      if (camPos.y <= 0) {
        this.level.renderNextLevel(context);
      }
    }
    return camPos.y > 0;
  }

  protected carCollisions(cam?: Camera, context?: CanvasRenderingContext2D): void {
    if (this.cars.length > 0) {
      const pairs: Map<number, Car> = new Map();
      const candidates: Car[] = this.cars
        .concat(this.player.jumping() ? [] : [this.player as Car])
        .filter( (c) => !c.crashes() );
      candidates.sort((a, b) => {
        const aPos = a.position();
        const bPos = b.position();
        return aPos.x - bPos.x;
      });
      let lastEnd = -1;
      for (let i = 0; i < candidates.length; i++) {
        const pos = candidates[i].position();
        if (i > 0 && lastEnd > pos.x) { // i overlaps with last car!
          for (let j = i - 1; j < candidates.length; j++) {
            if (i === j) {
              continue;
            }
            const oPos = candidates[j].position();
            if (oPos.x - pos.x >= 16) {
              break; // if current j is farther away than overlap, stop, not possible to collide any more
            } else if (Math.abs(oPos.y - pos.y) < 16) {
              // record the collision pair
              if (candidates[i].id() < candidates[j].id()) {
                pairs.set(candidates[i].id(), candidates[j]);
              } else {
                pairs.set(candidates[j].id(), candidates[i]);
              }
            }
          }
        }
        lastEnd = Math.floor(pos.x) + 16; // TODO car width constant?
      }
      if (pairs.size > 0) {
        if (context) {
          context.save();
          context.lineWidth = 1;
          context.strokeStyle = "#f00";
        }
        const justLanded = this.player.justLanded();
        for (const car of candidates) {
          const other = pairs.get(car.id());
          if (other) {
            if (cam && context) {
              const camPos = cam.position();
              [ car, other ].forEach ( (c) => {
                const carPos = c.position();
                context.strokeRect(0.5 + carPos.x - camPos.x, 0.5 + carPos.y - camPos.y, 16, 16);
              });
            }
            if (justLanded && (other === this.player || car === this.player)) {
              if (other === this.player) {
                this.player.destroy(car);
              } else {
                this.player.destroy(other);
              }
            } else {
              other.collide(car);
            }
          }
        }
        if (context) {
          context.restore();
        }
      }
    }
  }

  // a bit like the MCP in Tron, this manages all cars
  protected moveCars(): boolean[] {
    const result: boolean[] = [];
    const playerPos = this.player.position();
    const offsets: number[] = [ -1, 0, 1 ];
    const width = this.level.width();
    for (const car of this.cars) {
      result.push(!car.step());
      const carPos = car.position();
      const roads: number[] = [ 0, 0, 0 ];
      const ty = Math.floor(carPos.y / 32) - 1;
      if (ty >= 0) {
        for (let i = 0; i < roads.length; i++) {
          const tx = Math.floor(carPos.x / 32) + offsets[i];
          if (tx >= 0 && tx < width) {
            roads[i] += this.resources.tileValue(this.level.tile(tx, ty));
            if (i === 1) {
              // middle bias
              roads[i]--;
            }
          } else {
            roads[i] += 32 * 32;
          }
        }
      }
      let max = 65336;
      let dir = 1; // default: straight ahead
      for (let i = 0; i < roads.length; i++) {
        if (roads[i] < max) {
          dir = i;
          max = roads[i];
        }
      }
      if (dir === 1 && roads[1] < 0) {
        if (roads[0] > roads[2]) {
          dir++;
        } else if (roads[2] > roads[0]) {
          dir--;
        }
      }
      switch (dir) {
      case 0:
        car.left();
        break;
      case 1:
        if (car.id() % 8 > 3) {
          car.accelerate();
        }
        car.steer();
        break;
      case 2:
        car.right();
        break;
      default:
        break;
      }
    }
    return result;
  }

  protected place(car: Car, px?: number): boolean {
    const candidatePositions: number[] = [];
    const offset: number = 4 + Math.floor((Math.random() * 32));
    const max: number = this.level.width() * 32 - 16;
    for (let i = offset; i < max; i += 8) {
      candidatePositions.push(i);
    }
    let idx = candidatePositions.length;
    while (0 !== idx) {
      const rnd = Math.floor(Math.random() * idx);
      idx -= 1;
      const value = candidatePositions[idx];
      candidatePositions[idx] = candidatePositions[rnd];
      candidatePositions[rnd] = value;
    }
    const pos = car.position();
    for (const cx of candidatePositions) {
      if (px) {
        const delta = Math.abs(cx - px);
        if (delta >= 0 && delta < 15) {
          continue;
        }
      }
      pos.x = cx;
      if (!this.level.collides(car)) {
        return true;
      }
    }
    return false;
  }

}
