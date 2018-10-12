import * as dual from 'dual-range-bar';
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

// Current bound of the window
// [Right top, Left bottom] corners of the canvas
var currentBound: paper.Point[] = [];

// Canvas bound of the window
var canvasSize: paper.Point;

// A user interface on canvas
export class GridPaper {
  private uiOverlay:  UIOverlay;
  container   : HTMLElement;
  canvas      : HTMLCanvasElement;
  bound       : Rect;
  displayRect : Rect;

  // Flags
  aspectLock = true;
  get aspectLocked() { return this.aspectLock; }
  set aspectLocked(newVal) { this.aspectLock = newVal; }

  constructor(config: Config) {
    // UI and canvas container
    var container = document.getElementById(config.elementID);
    this.container = container;
    this.container.style.position = 'relative';

    // Display rect
    this.displayRect = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) { this._minx = newVal; },
      set maxX(newVal: number) { this._maxx = newVal; },
      set minY(newVal: number) { this._miny = newVal; },
      set maxY(newVal: number) { this._maxy = newVal; },
    } as Rect;

    // Bound rect
    this.bound = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) { this._minx = newVal; },
      set maxX(newVal: number) { this._maxx = newVal; },
      set minY(newVal: number) { this._miny = newVal; },
      set maxY(newVal: number) { this._maxy = newVal; },
    } as Rect;

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
  }

  destruct(): void {
    this.container.removeChild(this.uiOverlay.container);
  }
};

window.addEventListener('load', () => {
  try {
    var canvasViewer = new GridPaper(defaultConfig);
    
    paper.setup(canvasViewer.canvas.id);
    paper.tool = new paper.Tool();
    paper.tool.onMouseDown = (event: paper.ToolEvent) => {
      paper.project.view.translate(new paper.Point(10, 10));
    }
    var path = new paper.Path();
    path.strokeColor = 'black';
    path.add(new paper.Point(0, 0));
    path.add(new paper.Point(400, 300));
  } catch(err) { console.log(err); }
});
