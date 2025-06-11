import { Grid } from '@/types/grid';
import { inBounds, isPassable, pointEquals, Point } from '../utils';
import { DIRECTIONS } from './types';

/**
 * BFS実装用のキュー
 */
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * start→goalへの全最短経路を取得
 */
export const bfsAllShortestPaths = (grid: Grid, start: Point, goal: Point): Point[][] => {
  const dist = new Map<string, number>();
  const parents = new Map<string, Point[]>();
  
  const pointToKey = (p: Point): string => `${p.x},${p.y}`;
  
  const startKey = pointToKey(start);
  
  dist.set(startKey, 0);
  const queue = new Queue<Point>();
  queue.enqueue(start);
  
  let goalDistance = -1;
  
  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    const currentKey = pointToKey(current);
    const currentDist = dist.get(currentKey)!;
    
    // ゴール到達時の距離を記録
    if (pointEquals(current, goal)) {
      goalDistance = currentDist;
      break;
    }
    
    for (const direction of DIRECTIONS) {
      const next: Point = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };
      
      if (!inBounds(next, grid) || !isPassable(grid[next.y][next.x])) {
        continue;
      }
      
      const nextKey = pointToKey(next);
      const nextDist = currentDist + 1;
      
      if (!dist.has(nextKey)) {
        // 未訪問
        dist.set(nextKey, nextDist);
        parents.set(nextKey, [current]);
        queue.enqueue(next);
      } else if (dist.get(nextKey) === nextDist) {
        // 同距離での訪問（最短経路の一部）
        const existing = parents.get(nextKey) || [];
        existing.push(current);
        parents.set(nextKey, existing);
      }
    }
  }
  
  // ゴールに到達できない場合
  if (goalDistance === -1) {
    return [];
  }
  
  // 経路再構築
  const paths: Point[][] = [];
  
  const buildPaths = (current: Point, path: Point[]): void => {
    if (pointEquals(current, start)) {
      paths.push([...path, current].reverse());
      return;
    }
    
    const currentKey = pointToKey(current);
    const parentList = parents.get(currentKey) || [];
    
    for (const parent of parentList) {
      buildPaths(parent, [...path, current]);
    }
  };
  
  buildPaths(goal, []);
  return paths;
};