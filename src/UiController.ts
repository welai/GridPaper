import { GridPaper } from './index';
import * as dual from 'dual-range-bar';

export default class UIOverlay {
  // UI Overlay Container
  container : HTMLElement;
  // Synchronize UI components with the geometric properties
  syncView  : () => void;
  private horizontalBar : dual.HRange;
  private verticalBar   : dual.VRange;

  constructor(gridPaper: GridPaper) {
    // Create UI Overlay
    this.container = document.createElement('div');
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    gridPaper.container.appendChild(this.container);

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
    this.container.appendChild(hbarContainer);
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
    this.container.appendChild(vbarContainer);
    this.verticalBar = dual.VRange.getObject(vbar.id);
    this.verticalBar.lowerBound = 0;
    this.verticalBar.upperBound = 1;

    // Min differences of the range bars
    let rx = gridPaper.canvas.width / (gridPaper.bound.maxX - gridPaper.bound.minX);
    let ry = gridPaper.canvas.height / (gridPaper.bound.maxY - gridPaper.bound.minY);
    if (rx > ry) {
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

    // Synchronize the display rect with the UI elements & v.v.
    // But these function do not actually refresh the view
    var syncViewByHorizontal = () => {
      let lower = this.horizontalBar.lowerRange;
      let upper = this.horizontalBar.upperRange;
      let minX = lower * (gridPaper.bound.maxX - gridPaper.bound.minX);
      let maxX = upper * (gridPaper.bound.maxX - gridPaper.bound.minX);
      gridPaper.displayRect.setMinX(minX);
      gridPaper.displayRect.setMaxX(maxX);
      // Calculate the veritcal bar
      if (gridPaper.aspectLock) {
        let displayAspect = gridPaper.canvas.width / gridPaper.canvas.height;
        let verticalDiff = (maxX - minX) / displayAspect;
        let verticalMid = (gridPaper.displayRect.minY + gridPaper.displayRect.maxY) / 2;
        if (verticalMid - verticalDiff / 2 < gridPaper.bound.minY) {
          gridPaper.displayRect.setMinY(gridPaper.bound.minY);
          gridPaper.displayRect.setMaxY(gridPaper.bound.minY + verticalDiff);
        } else if (verticalMid + verticalDiff / 2 > gridPaper.bound.maxY) {
          gridPaper.displayRect.setMinY(gridPaper.bound.maxY - verticalDiff);
          gridPaper.displayRect.setMaxY(gridPaper.bound.maxY);
        } else {
          gridPaper.displayRect.setMinY(verticalMid - verticalDiff / 2);
          gridPaper.displayRect.setMaxY(verticalMid + verticalDiff / 2);
        }
      }
      // Synchronize the changes to the scroll bars
      this.verticalBar.setLowerRange((gridPaper.bound.maxY - gridPaper.displayRect.maxY) / (gridPaper.bound.maxY - gridPaper.bound.minY));
      this.verticalBar.setUpperRange((gridPaper.bound.maxY - gridPaper.displayRect.minY) / (gridPaper.bound.maxY - gridPaper.bound.minY));
    }
    var syncViewByVertical = () => {
      let lower = 1 - this.verticalBar.upperRange;
      let upper = 1 - this.verticalBar.lowerRange;
      let minY = lower * (gridPaper.bound.maxY - gridPaper.bound.minY);
      let maxY = upper * (gridPaper.bound.maxY - gridPaper.bound.minY);
      gridPaper.displayRect.setMinY(minY);
      gridPaper.displayRect.setMaxY(maxY);
      // Calculate the vertical bar
      if (gridPaper.aspectLock) {
        let displayAspect = gridPaper.canvas.width / gridPaper.canvas.height;
        let horizontalDiff = (maxY - minY) * displayAspect;
        let horizontalMid = (gridPaper.displayRect.minX + gridPaper.displayRect.maxX) / 2;
        if (horizontalMid - horizontalDiff / 2 < gridPaper.bound.minX) {
          gridPaper.displayRect.setMinX(gridPaper.bound.minX);
          gridPaper.displayRect.setMaxX(gridPaper.bound.minX + horizontalDiff);
        } else if (horizontalMid + horizontalDiff / 2 > gridPaper.bound.maxX) {
          gridPaper.displayRect.setMinX(gridPaper.bound.maxX - horizontalDiff);
          gridPaper.displayRect.setMaxX(gridPaper.bound.maxX);
        } else {
          gridPaper.displayRect.setMinX(horizontalMid - horizontalDiff / 2);
          gridPaper.displayRect.setMaxX(horizontalMid + horizontalDiff / 2);
        }
      }
      // Synchronize the changes to the scroll bars
      this.horizontalBar.setLowerRange((gridPaper.displayRect.minX - gridPaper.bound.minX) / (gridPaper.bound.maxX - gridPaper.bound.minX));
      this.horizontalBar.setUpperRange((gridPaper.displayRect.maxX - gridPaper.bound.minX) / (gridPaper.bound.maxX - gridPaper.bound.minX));
    }

    this.horizontalBar.addLowerRangeChangeCallback((val: number) => { syncViewByHorizontal(); });
    this.horizontalBar.addUpperRangeChangeCallback((val: number) => { syncViewByHorizontal(); });
    this.verticalBar.addLowerRangeChangeCallback((val: number) => { syncViewByVertical(); });
    this.verticalBar.addUpperRangeChangeCallback((val: number) => { syncViewByVertical(); });

    this.syncView = () => {
      let boundWidth  = gridPaper.bound.maxX - gridPaper.bound.minX;
      let boundHeight = gridPaper.bound.maxY - gridPaper.bound.minY;
      let minX = (gridPaper.displayRect.minX - gridPaper.bound.minX)/boundWidth;
      let maxX = (gridPaper.displayRect.maxX - gridPaper.bound.maxX)/boundWidth;
      let minY = (gridPaper.displayRect.minY - gridPaper.bound.minY)/boundHeight;
      let maxY = (gridPaper.displayRect.maxY - gridPaper.bound.maxY)/boundHeight;
      [
        this.horizontalBar.lowerRange,  this.horizontalBar.upperRange,
        this.verticalBar.lowerRange,    this.verticalBar.upperRange
      ] = [ minX, maxX, minY, maxY ];
    }
  }
}
