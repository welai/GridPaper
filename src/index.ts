import * as dual from 'dual-range-bar';
import Rect from './Rect';

// Configurations

interface UserConfig {
  elementID: string,
  // The grid series
  gridSeries?: number[][],
  // Coordinate limit
  bound?: Rect
};

interface Config extends UserConfig {
  elementID: string,
  // The grid series
  gridSeries: number[][],
  // Coordinate limit
  bound: Rect
};

var defaultConfig: Config = {
  elementID: 'preview',
  gridSeries: [[0.1, 0.1], [0.2, 0.2], [0.5, 0.1], [1, 0.5], [2, 2], [5, 1], [10, 1]],
  bound: { minX: -4000, maxX: 4000, minY: -6000, maxY: 6000 },
};

var config: Config = defaultConfig;

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
class GridPaper {
  private container:  HTMLElement;
  private uiOverlay:  HTMLElement;
  canvas:             HTMLCanvasElement;
  private horizontalBar: dual.HRange;
  private verticalBar:   dual.VRange;
  private aspectLock = true;
  displayRect = {
    _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
    get minX() { return this._minx; },
    get maxX() { return this._maxx; },
    get minY() { return this._miny; },
    get maxY() { return this._maxy; },
    set minX(newVal: number) { this._minx = newVal; },
    set maxX(newVal: number) { this._maxx = newVal; },
    set minY(newVal: number) { this._miny = newVal; },
    set maxY(newVal: number) { this._maxy = newVal; },
  };

  get aspectLocked() { return this.aspectLock; }
  set aspectLocked(newVal) { this.aspectLock = newVal; }

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.style.position = 'relative';
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
    // Create UI Overlay
    this.uiOverlay = document.createElement('div');
    this.uiOverlay.style.position = 'relative';
    this.uiOverlay.style.width = '100%';
    this.uiOverlay.style.height = '100%';
    this.container.appendChild(this.uiOverlay);

    // Horizontal dual range bar for scrolling
    let hbarContainer = document.createElement('div');
    hbarContainer.style.height = '20px';
    hbarContainer.style.width = 'calc(100% - 100px)';
    hbarContainer.style.margin = '10px 30px';
    hbarContainer.style.position = 'absolute';
    hbarContainer.style.bottom = '0px';
    let hbar = document.createElement('div');
    hbar.id = 'horizontal-scrolling-bar';
    hbar.style.height = '100%';
    hbar.style.width = '100%';
    hbar.style.position = 'relative';
    hbarContainer.appendChild(hbar);
    this.uiOverlay.appendChild(hbarContainer);
    this.horizontalBar = dual.HRange.getObject(hbar.id);
    this.horizontalBar.lowerBound = 0;
    this.horizontalBar.upperBound = 1;
    // Vertical dual range bar for scrolling
    let vbarContainer = document.createElement('div');
    vbarContainer.style.height = 'calc(100% - 100px)';
    vbarContainer.style.width = '20px';
    vbarContainer.style.margin = '30px 10px';
    vbarContainer.style.position = 'absolute';
    vbarContainer.style.right = '0px';
    let vbar = document.createElement('div');
    vbar.id = 'vertical-scrolling-bar';
    vbar.style.height = '100%';
    vbar.style.width = '100%';
    vbar.style.position = 'relative';
    vbarContainer.appendChild(vbar);
    this.uiOverlay.appendChild(vbarContainer);
    this.verticalBar = dual.VRange.getObject(vbar.id);
    this.verticalBar.lowerBound = 0;
    this.verticalBar.upperBound = 1;
    // (window as any)['canvasUI'] = this;

    this.initView();
    this.horizontalBar.addLowerRangeChangeCallback((val: number) => { this.syncViewByHorizontal(); this.display(); });
    this.horizontalBar.addUpperRangeChangeCallback((val: number) => { this.syncViewByHorizontal(); this.display(); });
    this.verticalBar.addLowerRangeChangeCallback((val: number) => { this.syncViewByVertical(); this.display(); });
    this.verticalBar.addUpperRangeChangeCallback((val: number) => { this.syncViewByVertical(); this.display(); });
  }

  initView(): void {
    // Min differences of the range bars
    let rx = this.canvas.width / (config.bound.maxX - config.bound.minX);
    let ry = this.canvas.height / (config.bound.maxY - config.bound.minY);
    if(rx > ry) {
      this.horizontalBar.relativeMinDifference = 0.1 * rx / ry;
      this.horizontalBar.relativeMaxDifference = 1.0;
      this.verticalBar.relativeMinDifference = 0.1;
      this.verticalBar.relativeMaxDifference = 1.0 * ry / rx;
    } else {
      this.horizontalBar.relativeMinDifference = 0.1;
      this.horizontalBar.relativeMaxDifference = 1.0 * rx / ry;
      this.verticalBar.relativeMinDifference = 0.1 * ry / rx;
      this.verticalBar.relativeMaxDifference = 1.0;
    }
    // TODO: Initialize the view
  }

  // Synchronize the display rect with the UI elements & v.v.
  // But these function do not actually refresh the view
  syncViewByHorizontal(): void {
    let lower = this.horizontalBar.lowerRange;
    let upper = this.horizontalBar.upperRange;
    var minX = lower * (config.bound.maxX - config.bound.minX);
    var maxX = upper * (config.bound.maxX - config.bound.minX);
    this.displayRect.minX = minX;
    this.displayRect.maxX = maxX;
    // Calculate the veritcal bar
    if(this.aspectLock) {
      let displayAspect = this.canvas.width / this.canvas.height;
      let verticalDiff = (maxX - minX) / displayAspect;
      let verticalMid = (this.displayRect.minY + this.displayRect.maxY) / 2;
      if(verticalMid - verticalDiff/2 < config.bound.minY) {
        this.displayRect.minY = config.bound.minY;
        this.displayRect.maxY = config.bound.minY + verticalDiff;
      } else if(verticalMid + verticalDiff/2 > config.bound.maxY) {
        this.displayRect.minY = config.bound.maxY - verticalDiff;
        this.displayRect.maxY = config.bound.maxY;
      } else {
        this.displayRect.minY = verticalMid - verticalDiff/2;
        this.displayRect.maxY = verticalMid + verticalDiff/2;
      }
    }
    // Synchronize the changes to the scroll bars
    this.verticalBar.setLowerRange((config.bound.maxY - this.displayRect.maxY)/(config.bound.maxY - config.bound.minY));
    this.verticalBar.setUpperRange((config.bound.maxY - this.displayRect.minY)/(config.bound.maxY - config.bound.minY));
  }
  syncViewByVertical(): void {
    let lower = 1 - this.verticalBar.upperRange;
    let upper = 1 - this.verticalBar.lowerRange;
    var minY = lower * (config.bound.maxY - config.bound.minY);
    var maxY = upper * (config.bound.maxY - config.bound.minY);
    this.displayRect.minY = minY;
    this.displayRect.maxY = maxY;
    // Calculate the vertical bar
    if(this.aspectLock) {
      let displayAspect = this.canvas.width / this.canvas.height;
      let horizontalDiff = (maxY - minY) * displayAspect;
      let horizontalMid = (this.displayRect.minX + this.displayRect.maxX) / 2;
      if(horizontalMid - horizontalDiff/2 < config.bound.minX) {
        this.displayRect.minX = config.bound.minX;
        this.displayRect.maxX = config.bound.minX + horizontalDiff;
      } else if(horizontalMid + horizontalDiff/2 > config.bound.maxX) {
        this.displayRect.minX = config.bound.maxX - horizontalDiff;
        this.displayRect.maxX = config.bound.maxX;
      } else {
        this.displayRect.minX = horizontalMid - horizontalDiff/2;
        this.displayRect.maxX = horizontalMid + horizontalDiff/2;
      }
    }
    // Synchronize the changes to the scroll bars
    this.horizontalBar.setLowerRange((this.displayRect.minX - config.bound.minX)/(config.bound.maxX - config.bound.minX));
    this.horizontalBar.setUpperRange((this.displayRect.maxX - config.bound.minX)/(config.bound.maxX - config.bound.minX));
  }
  // Canvas display update
  display(): void {

  }

  destruct(): void {
    this.container.removeChild(this.uiOverlay);
  }
};

window.addEventListener('load', () => {
  try {
    var div: HTMLElement = document.getElementById(config.elementID);
    var canvasViewer = new GridPaper(div);
    
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
