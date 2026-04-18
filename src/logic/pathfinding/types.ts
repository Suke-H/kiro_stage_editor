import { Point } from '../utils';

// BFS探索で使用する候補型
export interface Candidate {
  path: Point[];
  kind: number; // 0: real goal, 1: dummy goal, 2: rest, 3: flag, 4: switch, 5: invert switch, 6: player invert switch
  crowCount: number;
}

// 方向定数
export const DIRECTIONS: Point[] = [
  { x: -1, y: 0 }, // left
  { x: 1, y: 0 },  // right  
  { x: 0, y: -1 }, // up
  { x: 0, y: 1 },  // down
];
