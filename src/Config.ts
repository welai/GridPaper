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
  gridSeries: [[10, 2], [50, 10], [100, 10]],
  bound: { minX: -500, maxX: 1500, minY: -500, maxY: 1500 },
};
