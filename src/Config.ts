import { Rect } from './Rect';

// Configurations
export interface UserConfig {
  elementID: string,
  // The grid series
  gridSeries?: number[][],
  // Coordinate limit
  bound?: Rect
};

export interface Config extends UserConfig {
  elementID: string,
  // The grid series
  gridSeries: number[][],
  // Coordinate limit
  bound: Rect
};

export var defaultConfig: Config = {
  elementID: 'preview',
  gridSeries: [[0.1, 0.1], [0.2, 0.2], [0.5, 0.1], [1, 0.5], [2, 2], [5, 1], [10, 1]],
  bound: { minX: -4000, maxX: 4000, minY: -6000, maxY: 6000 },
};
