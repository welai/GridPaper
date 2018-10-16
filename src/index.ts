import { Config, defaultConfig } from './Config';
import { Rect, GeometricRect } from './Rect';
import UIOverlay from './UiController';

// TODO: Grids
// TODO: Refactor the index file

(function checkWhenImported(): void {
  // Check if the script is running on a browser environment
  if (typeof window === 'undefined')
    throw Error('Grid paper only works on a browser.\nPlease check out if your configuration is correct.');
  // Check paper
  if (typeof paper === 'undefined')
    throw Error('paper.js is not detected.\nThis might happen due to a broken dependency');
})();

// A user interface on canvas
export class GridPaper {
  /**
   * Grid paper container, the div element to initialize on
   */
  container: HTMLElement;
  /**
   * UI control conponents
   */
  uiOverlay: UIOverlay;
  /**
   * Canvas to draw
   */
  canvas: HTMLCanvasElement;

  // Paper stuffs
  /**
   * Paper project instance
   */
  paperProject: paper.Project;
  /**
   * Paper tool instance
   */
  paperTool: paper.Tool;

  // Geometric properties
  /**
   * The coordinary boundary of the project
   */
  bound: GeometricRect;
  /**
   * Rectangular area indicating current display
   */
  displayRect: GeometricRect;

  // Flags
  private aspectLock = true;
  get aspectLocked() { return this.aspectLock; }
  set aspectLocked(newVal) { this.aspectLock = newVal; }
  
  display() {
    let [ minX, maxX, minY, maxY ] = [
      this.displayRect.minX,
      this.displayRect.maxX,
      this.displayRect.minY,
      this.displayRect.maxY
    ];
    let p = this.paperProject.view.pixelRatio;
    let [ w, h ] = [this.canvas.width/p, this.canvas.height/p];
    this.paperProject.view.matrix.a = w/(maxX -minX);
    this.paperProject.view.matrix.b = 0;
    this.paperProject.view.matrix.c = 0;
    this.paperProject.view.matrix.d = h/(minY - maxY);
    this.paperProject.view.matrix.tx = w*minX/(minX - maxX);
    this.paperProject.view.matrix.ty = h*maxY/(maxY - minY);
  }

  constructor(config: Config) {
    // UI and canvas container
    var container = document.getElementById(config.elementID);
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
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
    resizeCallback();
    this.canvas.addEventListener('resize', resizeCallback);

    let parent = this;
    // Display rect
    (window as any).displayRect = this.displayRect = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _maxy: config.bound.maxY,
      _miny: config.bound.maxY - (config.bound.maxX - config.bound.minX)/this.canvas.width*this.canvas.height,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMinX(newVal);
      },
      set maxX(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMaxX(newVal);
      },
      set minY(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMinY(newVal);
      },
      set maxY(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMaxY(newVal);
      },
      // These setting functions have no callbacks
      setMinX(newVal: number) { this._minx = newVal; parent.display(); },
      setMaxX(newVal: number) { this._maxx = newVal; parent.display(); },
      setMinY(newVal: number) { this._miny = newVal; parent.display(); },
      setMaxY(newVal: number) { this._maxy = newVal; parent.display(); }
    };

    // Bound rect
    this.bound = {
      _minx: config.bound.minX, _maxx: config.bound.maxX, _miny: config.bound.minY, _maxy: config.bound.maxY,
      get minX() { return this._minx; },
      get maxX() { return this._maxx; },
      get minY() { return this._miny; },
      get maxY() { return this._maxy; },
      set minX(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMinX(newVal);
      },
      set maxX(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMaxX(newVal);
      },
      set minY(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMinY(newVal);
      },
      set maxY(newVal: number) {
        if (parent.uiOverlay) { parent.uiOverlay.syncView(); }
        this.setMaxY(newVal);
      },
      // These setting functions have no callbacks
      setMinX(newVal: number) { this._minx = newVal; parent.display(); },
      setMaxX(newVal: number) { this._maxx = newVal; parent.display(); },
      setMinY(newVal: number) { this._miny = newVal; parent.display(); },
      setMaxY(newVal: number) { this._maxy = newVal; parent.display(); }
    };

    // Create UI overlay
    this.uiOverlay = new UIOverlay(this);

    // Set up paper on canvas
    this.paperProject = new paper.Project(this.canvas);
    this.paperTool = new paper.Tool();

    this.paperTool.onMouseDown = (event: paper.ToolEvent) => {
      this.paperProject.view.translate(new paper.Point(10, 10));
    }
    for(let i = config.bound.minX; i <= config.bound.maxX; i += 400) {
      for(let j = config.bound.minY; j <= config.bound.maxY; j += 400) {
        var point = new paper.Point(i, j);
        var text = new paper.PointText({ content: `${i}, ${j}`, justification: 'center' });
        text.point = point;
      }
    }
    this.display();
  }

  // View controlling
  /**
   * Scaling the display rectangle
   */
  zoomDisplay(point: paper.Point, scale: number): void;
  zoomDisplay(projectX: number, projectY: number, scale: number): void;
  zoomDisplay(...args: any[]) {
    // First case
    var x, y: number;
    if(typeof args[0] != 'number') {
      x = (args[0] as paper.Point).x;
      y = (args[0] as paper.Point).y;
    } else {
      x = args[0] as number;
      y = args[1] as number;
    }
    let scale = args.pop();
    // Nothing to scale
    if(scale == 1) return;
    // Too big to scale
    if(scale > 1 && (this.displayRect.minX == this.bound.minX && this.displayRect.maxX == this.bound.maxX
      || this.displayRect.minY == this.bound.minY && this.displayRect.maxY == this.bound.maxY))
        return;
    // Too small to scale
    if(scale < 1 && this.uiOverlay.horizontalBar.upperRange - this.uiOverlay.horizontalBar.lowerRange < this.uiOverlay.horizontalBar.minDifference)
      return;
    if(scale < 1 && this.uiOverlay.verticalBar.upperRange - this.uiOverlay.verticalBar.lowerRange < this.uiOverlay.verticalBar.minDifference)
      return;
    let offsets: Rect = {
      minX: this.displayRect.minX - x,
      maxX: this.displayRect.maxX - x,
      minY: this.displayRect.minY - y,
      maxY: this.displayRect.maxY - y
    };
    offsets.minX *= scale; offsets.maxX *= scale;
    offsets.minY *= scale; offsets.maxY *= scale;
    let expected: Rect = {
      minX: offsets.minX + x,
      maxX: offsets.maxX + x,
      minY: offsets.minY + y,
      maxY: offsets.maxY + y
    }
    if(expected.minY < this.bound.minY) {
      let d = this.bound.minY - expected.minY;
      expected.minY = this.bound.minY;
      expected.maxY += d;
      if(expected.maxY > this.bound.maxY) {
        expected.maxY = this.bound.maxX;
        let expectedDx = (this.bound.maxY - this.bound.minY)/this.canvas.height*this.canvas.width;
        let diff = expectedDx - (expected.maxX - expected.minX);
        expected.maxX += diff/2; expected.minX -= diff/2;
      }
    }
    if(expected.maxY > this.bound.maxY) {
      let d = expected.maxY - this.bound.maxY;
      expected.maxY = this.bound.maxY;
      expected.minY -= d;
      if(expected.minY < this.bound.minY) {
        expected.minY = this.bound.minY;
        let expectedDx = (this.bound.maxY - this.bound.minY)/this.canvas.height*this.canvas.width;
        let diff = expectedDx - (expected.maxX - expected.minX);
        expected.minX += diff/2; expected.minX -= diff/2;
      }
    }
    if(expected.minX < this.bound.minX) {
      let d = this.bound.minX - expected.minX;
      expected.minX = this.bound.minX;
      expected.maxX += d;
      if(expected.maxX > this.bound.maxX) {
        expected.maxX = this.bound.maxX;
        let expectedDy = (this.bound.maxX - this.bound.minX)/this.canvas.width*this.canvas.height;
        let diff = expectedDy - (expected.maxY - expected.minY);
        expected.maxY += diff/2; expected.minY -= diff/2;
      }
    }
    if(expected.maxX > this.bound.maxX) {
      let d = expected.maxX - this.bound.maxX;
      expected.maxX = this.bound.maxX;
      expected.minX -= d;
      if(expected.minX < this.bound.minX) {
        expected.minX = this.bound.minX;
        let expectedDy = (this.bound.maxX - this.bound.minX)/this.canvas.width*this.canvas.height;
        let diff = expectedDy - (expected.maxY - expected.minY);
        expected.maxY += diff/2; expected.minY -= diff/2;
      }
    }

    // Update view
    this.displayRect.minX = expected.minX;
    this.displayRect.maxX = expected.maxX;
    this.displayRect.minY = expected.minY;
    this.displayRect.maxY = expected.maxY;
    this.uiOverlay.syncView();
  }
  /**
   * Zoom factor of current view: display/bound
   */
  get zoomFactor() { return (this.displayRect.maxX - this.displayRect.minX)/(this.bound.maxX - this.bound.minX); }

  scrollHorizontally(offset: number) {
    if(this.displayRect.minX + offset < this.bound.minX) offset = this.bound.minX - this.displayRect.minX;
    if(this.displayRect.maxX + offset > this.bound.maxX) offset = this.bound.maxX - this.displayRect.maxX;
    this.displayRect.minX += offset;
    this.displayRect.maxX += offset;
    this.uiOverlay.syncView();
  }

  scrollVertically(offset: number) {
    if(this.displayRect.minY + offset < this.bound.minY) offset = this.bound.minY - this.displayRect.minY;
    if(this.displayRect.maxY + offset > this.bound.maxY) offset = this.bound.maxY - this.displayRect.maxY;
    this.displayRect.minY += offset;
    this.displayRect.maxY += offset;
    this.uiOverlay.syncView();
  }

  destruct(): void {
    this.container.removeChild(this.uiOverlay.container);
    this.container.removeChild(this.canvas);
  }
};

window.addEventListener('load', () => {
  try {
    new GridPaper(defaultConfig);
  } catch (err) { console.log(err); }
});
