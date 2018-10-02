import * as dual from 'dual-range-bar';

// Configurations

interface Config {
  canvasID: string,
  // The grid series
  gridSeries?: number[][],
  // Coordinate limit
  minX?:number, maxX?: number, minY?:number, maxY?:number,
};

var defaultConfig: Config = {
  canvasID: 'paperCanvas',
  gridSeries: [[0.1, 0.1], [0.2, 0.2], [0.5, 0.1], [1, 0.5], [2, 2], [5, 1], [10, 1]],
  minX: -5000, maxX: 5000, minY: -5000, maxY: 5000,
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
class CanvasUI {
  private wrapper:HTMLElement = document.createElement('div');
  private canvas: HTMLElement;
  horizontalBar: dual.HRange;
  verticalBar: dual.VRange;

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    this.wrapper.appendChild(canvas.cloneNode(true));
    canvas.parentNode.replaceChild(this.wrapper, canvas);
    this.wrapper.style.display = 'inline-block';
    this.wrapper.style.position = 'relative';
    // Horizontal dual range bar for scrolling
    let hbar = document.createElement('div');
    hbar.id = 'horizontal-scrolling-bar';
    hbar.style.height = '20px';
    hbar.style.margin = '0px 20px';
    hbar.style.top = '-30px';
    hbar.style.position = 'relative';
    this.wrapper.appendChild(hbar);
    this.horizontalBar = dual.HRange.getObject(hbar.id);
    // Vertical dual range bar for scrolling
    let vbar = document.createElement('div');
    vbar.id = 'vertical-scrolling-bar';
    vbar.style.height = '200px';
    vbar.style.width = '20px';
    vbar.style.margin = '20px 0px';
    vbar.style.cssFloat = 'right';
    vbar.style.position = 'relative';
    vbar.style.top = '0px';
    vbar.style.right = '0px';
    this.wrapper.appendChild(vbar);
    this.verticalBar = dual.VRange.getObject(vbar.id);
  }

  destruct(): void {
    this.wrapper.parentNode.replaceChild(this.wrapper, this.canvas);
  }
};

window.addEventListener('load', () => {
  try {
    var canvas: HTMLElement = document.getElementById(config.canvasID);
    var ui = new CanvasUI(canvas);

    paper.setup(config.canvasID);
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
