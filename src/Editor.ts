import {Level} from "./Level";
import {Resources} from "./Resources";

type TileSelector = (n: number) => any;

export class Editor {

  private level: Level;
  private levels: Level[];
  private tiles: HTMLImageElement[];
  private canvas: HTMLCanvasElement;
  private levelSelect: HTMLSelectElement;

  public constructor(resources: Resources, document: HTMLDocument, level: Level, levels?: Level[]) {
    this.level = level;
    this.levels = levels ? levels : [ level ];
    const element: HTMLElement = document.createElement("div");
    element.setAttribute("id", "layout");
    element.setAttribute("tabindex", "0");
    element.setAttribute("style", ':after { content: ""; display: table; clear: both;}');
    element.innerHTML = '<div style="float: left; margin-right: 1em;"><div><img id="tile-preview" width="128" height="128"></div><div id="tiles"></div></div><div style="float: left; margin-right: 1em;"><div style="border: 1px solid; overflow-y: scroll; overflow-x: auto; width: 572px; height: 600px;"><canvas id="level" width="512" height="640"></canvas></div></div><div style="float: left; margin-right: 1em;"><p>Cursor keys to navigate selected tile.</p><p>Use Ctrl+cursor keys to clone rows/columns at current mouse pointer position.</p><p>ctrl+space fills at current position, ctrl+z undos last action</p><p><button type="button" id="export">export</button><button type="button" id="import">import</button><input type="text" id="map" minlength="10"></p><p>Level: <select id="levels"></select></p><p><img id="level-preview"></p></div>';
    document.body.appendChild(element);
    this.init(resources, document);
  }

  public setLevel(level: Level): void {
    this.level = level;
    this.levelSelect.selectedIndex = 1 + this.levels.indexOf(level);
  }

  public getLevel(): Level {
    return this.level;
  }

  private initKeyBindings(document: HTMLDocument, memo: any, selectTile: TileSelector) {
    const root = document.getElementById("layout");
    const getIndex = () => {
      return parseInt(memo.previous.getAttribute("data-index"), 10);
    };
    const navHandlers = {
      ArrowDown: (event) => {
        const next = getIndex() + 4;
        if (next < this.tiles.length) {
          selectTile(next);
        }
      },
      ArrowLeft: (event) => {
        const next = getIndex() - 1;
        if (next >= 0) {
          selectTile(next);
        }
      },
      ArrowRight: (event) => {
        const next = getIndex() + 1;
        if (next < this.tiles.length) {
          selectTile(next);
        }
      },
      ArrowUp: (event) => {
        const next = getIndex() - 4;
        if (next >= 0) {
          selectTile(next);
        }
      },
    };
    const stop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const modHandlers = {
      " ": (event) => {
        if (this.level.fill(
          Math.floor(memo.mouse.x / 32),
          Math.floor(memo.mouse.y / 32),
          parseInt(memo.previous.getAttribute("data-index"), 10),
         )) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
      "ArrowDown": (event) => {
        const y = Math.floor(memo.mouse.y / 32);
        if (this.level.cloneRow(y, y + 1)) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
      "ArrowLeft": (event) => {
        const x = Math.floor(memo.mouse.x / 32);
        if (this.level.cloneColumn(x, x - 1)) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
      "ArrowRight": (event) => {
        const x = Math.floor(memo.mouse.x / 32);
        if (this.level.cloneColumn(x, x + 1)) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
      "ArrowUp": (event) => {
        const y = Math.floor(memo.mouse.y / 32);
        if (this.level.cloneRow(y, y - 1)) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
      "z": (event) => {
        if (this.level.restore()) {
          this.level.render(this.canvas);
          stop(event);
        }
      },
    };
    root.onkeyup = (event) => {
      if (!event.ctrlKey) {
        if (navHandlers[event.key]) {
          navHandlers[event.key](event);
          event.preventDefault();
        }
      } else {
        if (modHandlers[event.key]) {
          modHandlers[event.key](event);
          event.preventDefault();
        }
      }
    };
    root.focus();
  }

  private initImportExport(document: HTMLDocument): void {
    const mapData = document.getElementById("map") as HTMLInputElement;
    const inButton = document.getElementById("export");
    const outButton = document.getElementById("import");
    inButton.onclick = (event) => {
      const temp = document.createElement("canvas");
      const tempCtx = temp.getContext("2d");
      const pixel = tempCtx.createImageData(1, 1);
      pixel.data.fill(255, 3, 4); // alpha
      temp.height = this.level.height();
      temp.width = this.level.width();
      for (let y = 0; y < temp.height; y++) {
        for (let x = 0; x < temp.width; x++) {
          pixel.data.fill(this.level.tile(x, y), 0, 3);
          tempCtx.putImageData(pixel, x, y);
        }
      }
      mapData.value = temp.toDataURL();
      event.preventDefault();
    };
    outButton.onclick = (event) => {
      const img = document.createElement("img") as HTMLImageElement;
      img.src = mapData.value;
      const tempCanvas = document.createElement("canvas");
      this.level.tiles(img, tempCanvas);
      this.level.render(this.canvas);
      event.preventDefault();
    };
  }

  private init(resources: Resources, document: HTMLDocument): void {
    const preview: HTMLImageElement = document.getElementById("tile-preview") as HTMLImageElement;
    const container = document.getElementById("tiles");
    const memo = {
      mouse: { x: 0, y: 0 },
      previous: null,
    };
    const selectTile = (selection) => {
      const img = this.tiles[selection];
      preview.src = img.src;
      memo.previous.setAttribute("style", "border: none");
      memo.previous = img;
      img.setAttribute("style", "border: 1px solid red;");
    };
    let idx = 0;
    let tile = resources.tile(idx);
    this.tiles = [];
    do {
      if (idx % 4 === 0) {
        container.appendChild(document.createElement("br"));
      } else {
        container.appendChild(document.createTextNode(" "));
      }
      const img = document.createElement("img") as HTMLImageElement;
      img.src = tile.toDataURL();
      img.width = 32;
      img.height = 32;
      img.setAttribute("data-index", idx.toString());
      img.onclick = (event) => {
        selectTile(parseInt((event.target as HTMLImageElement).getAttribute("data-index"), 10));
      };
      container.appendChild(img);
      this.tiles.push(img);
      if (!preview.src) {
        preview.src = img.src;
        memo.previous = img;
        img.setAttribute("style", "border: 1px solid red;");
      }
      idx++;
      tile = resources.tile(idx);
    } while (tile);
    this.canvas = document.getElementById("level") as HTMLCanvasElement;
    const theEditor = this;
    const theCanvas = this.canvas;
    this.canvas.onmousemove = (event) => {
      memo.mouse = { x: event.layerX, y: event.layerY };
      if (theEditor.getLevel().mouse(event.layerX, event.layerY)) {
        theEditor.getLevel().render(theCanvas);
      }
    };
    this.canvas.onmouseout = (event) => {
      if (theEditor.getLevel().mouse(-1)) {
        theEditor.getLevel().render(theCanvas);
      }
    };
    this.canvas.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.level.save();
      this.level.tile(
        Math.floor(event.layerX / 32),
        Math.floor(event.layerY / 32),
        parseInt(memo.previous.getAttribute("data-index"), 10),
      );
      this.level.render(this.canvas);
    };
    this.initKeyBindings(document, memo, selectTile);
    this.initImportExport(document);
    this.levelSelect = document.getElementById("levels") as HTMLSelectElement;
    const blank = document.createElement("option");
    blank.innerText = "new";
    this.levelSelect.appendChild(blank);
    for (let i = 0; i < this.levels.length; i++) {
      const option = document.createElement("option");
      const text = (i + 1).toString();
      option.innerText = text;
      option.setAttribute("value", text);
      this.levelSelect.appendChild(option);
    }
    const levelPreview = document.getElementById("level-preview") as HTMLImageElement;
    this.levelSelect.onchange = (event) => {
      const target: HTMLSelectElement = event.target as HTMLSelectElement;
      const index = parseInt(target.value, 10) - 1;
      if (index >= 0) {
        this.updateLevel(document, index);
      }
    };
    this.levelSelect.selectedIndex = 1 + this.levels.indexOf(this.level);
    this.updateLevel(document);
  }

  private updateLevel(document: HTMLDocument, index?: number) {
    if (typeof index === "number") {
      this.setLevel(this.levels[index]);
    }
    const levelPreview = document.getElementById("level-preview") as HTMLImageElement;
    this.level.render(this.canvas);
    levelPreview.src = this.level.preview(document);
    levelPreview.width = this.level.width() * 2;
    levelPreview.height = this.level.height() * 2;
  }

}
