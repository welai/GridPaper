import { Config, defaultConfig } from './Config';
import Rect from './Rect';
import UIOverlay from './UiController';

(function checkWhenImported(): void {
  // Check if the script is running on a browser environment
  if(typeof window === 'undefined')
    throw Error('Grid paper only works on a browser.\nPlease check out if your configuration is correct.');
  // Check paper
  if(typeof paper === 'undefined')
    throw Error('paper.js is not detected.\nThis might happen due to a broken dependency');
})();

// TODO: Enable custom callbacks
interface GeometricRect extends Rect {
  _minx: number, _maxx: number, _miny: number, _maxy: number,
  setMinX?: (newVal: number) => void,
  setMaxX?: (newVal: number) => void,
  setMinY?: (newVal: number) => void,
  setMaxY?: (newVal: number) => void
}

class CanvasElementList extends Array<paper.Item> {
  constructor(n: number);
  constructor(...items: paper.Item[]);
  constructor(...params: any[]) {
    super(...params);
  }
  add(item: paper.Item): void {
    this.push(item);
  }
  remove(item: paper.Item): void {
    let i = this.indexOf(item);
    if(i != -1) {
      paper.project.
      this.splice(i, 1);
    }
  }
}

// A user interface on canvas
export class GridPaper {
  // Grid paper container, the div element to initialize on
  container   : HTMLElement;
  // UI control conponents
  uiOverlay   : UIOverlay;
  // Canvas to draw
  canvas      : HTMLCanvasElement;
  // Controllable elements
  elements    : CanvasElementList = new CanvasElementList();

  // Geometric properties
  bound       : GeometricRect;
  displayRect : GeometricRect;

  // Flags
  aspectLock = true;
  get aspectLocked() { return this.aspectLock; }
  set aspectLocked(newVal) { this.aspectLock = newVal; }

  constructor(config: Config) {
    // UI and canvas container
    var container = document.getElementById(config.elementID);
    this.container = container;
    this.container.style.position = 'relative';

    let parent = this;
    // Display rect
    this.displayRect = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._minx = newVal;
      },
      set maxX(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._maxx = newVal;
      },
      set minY(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._miny = newVal;
      },
      set maxY(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._maxy = newVal;
      },
      // These setting functions have no callbacks
      setMinX(newVal: number) { this._minx = newVal; },
      setMaxX(newVal: number) { this._maxx = newVal; },
      setMinY(newVal: number) { this._miny = newVal; },
      setMaxY(newVal: number) { this._maxy = newVal; }
    };

    // Bound rect
    this.bound = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._minx = newVal;
      },
      set maxX(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._maxx = newVal;
      },
      set minY(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._miny = newVal;
      },
      set maxY(newVal: number) { 
        if(parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this._maxy = newVal;
      },
      // These setting functions have no callbacks
      setMinX(newVal: number) { this._minx = newVal; },
      setMaxX(newVal: number) { this._maxx = newVal; },
      setMinY(newVal: number) { this._miny = newVal; },
      setMaxY(newVal: number) { this._maxy = newVal; }
    };

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.id = (this.container.id ? this.container.id : 'preview-container') + '-canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);
    var resizeCallback = () => {
      this.canvas.width   = this.canvas.clientWidth;
      this.canvas.height  = this.canvas.clientHeight;
    }
    resizeCallback();
    this.canvas.addEventListener('resize', resizeCallback);

    // Create UI overlay
    this.uiOverlay = new UIOverlay(this);

    // Set up paper on canvas
    paper.setup(this.canvas);
    paper.tool = new paper.Tool();

    paper.tool.onMouseDown = (event: paper.ToolEvent) => {
      paper.project.view.translate(new paper.Point(10, 10));
    }
    for(let i = config.bound.minX; i <= config.bound.maxX; i += 100) {
      for(let j = config.bound.minY; j <= config.bound.maxY; j += 100) {
        var point = new paper.Point(i, j);
        var text = new paper.PointText({ content: `${i}, ${j}`, justification: 'center' });
        text.point = point;
      }
    }
  }

  destruct(): void {
    this.container.removeChild(this.uiOverlay.container);
  }
};

window.addEventListener('load', () => {
  try {
    new GridPaper(defaultConfig);
  } catch(err) { console.log(err); }
});
