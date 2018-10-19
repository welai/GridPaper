# GridPaper

GridPaper allows you to add controlling to a paper.js canvas. Major features include:

- Use cartesian coordinates. The positive direction of the y axis is to the top
- Show customizable grids on the paper.js canvas
- User-friendly interactions

## Using GridPaper

GridPaper is written as a UMD library, and can be imported by either directly import with HTML `<script/>` tag, or makes it work as a module.

GridPaper needs [paper.js](http://paperjs.org/) as its dependency, so you should import or install paper.js first.

### Directly

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.11.5/paper-full.min.js"></script>
<script src="dist/gridpaper.js"></script>
```

And the JavaScript part:

```javascript
window.addEventListener('load', () => {
  window.gridPaper = new GridPaper({ elementID: 'preview' });
});
```

### With modules

```javascript
import GridPaper from 'gridpaper';
```

## Set-up GridPaper

The prototype of the GridPaper constructor allows only one parameter which serves as the configuration object. The object must have the property `elementID` indicating the div id where GridPaper would initialize.

```javascript
window.addEventListener('load', () => {
  window.gridPaper = new GridPaper({ elementID: 'preview' });
});
```

## Constructor configuration

```typescript
// Configurations
export interface Config {
  /** Div ID */
  elementID: string,
  /** 
   * A list of ordered pairs, indicating the grid units of the grid paper.
   * The ordered pairs start with the major grid unit, and end with the minor.
   * The list should be ranked in increasing order of the major grid units.
   */
  gridSeries?: number[][],
  /** Coordinate limits */
  bound?: Rect,
  /** Maximum major grid density */
  majorGridDensity?: number,
  /** Aspect locked */
  aspeckLocked?: true,
  /** Show grid */
  showGrid?: true
};
```

## API

```javascript
// The canvas to draw on
gridpaper.canvas
// Paper project instance
gridpaper.paperProject
// Paper tool instance
gridpaper.paperTool
```

## TODOs

- Keywords
- Install directions
- Add license

## License

MIT
