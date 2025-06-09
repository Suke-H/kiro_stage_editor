import { Grid, GridCell, GridCellKey } from '@/types/grid';
import { Vector } from '@/types/path';

// Point型の定義（Vector型と同じ）
export type Point = Vector;

/**
 * 座標が盤面内にあるかチェック
 */
export function inBounds(point: Point, grid: Grid): boolean {
  return point.y >= 0 && point.y < grid.length && 
         point.x >= 0 && point.x < grid[0].length;
}

/**
 * セルが通行可能かチェック
 */
export function isPassable(cell: GridCell): boolean {
  return cell.type !== 'Empty' && cell.side !== 'back';
}

/**
 * グリッドから特定のキーを持つセルを1つ探す
 */
export function findSingle(grid: Grid, key: GridCellKey): Point | null {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x].type === key) {
        return { x, y };
      }
    }
  }
  return null;
}

/**
 * グリッドから特定のキーを持つセル座標をすべて探す
 */
export function findAll(grid: Grid, key: GridCellKey): Point[] {
  const results: Point[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x].type === key) {
        results.push({ x, y });
      }
    }
  }
  return results;
}

/**
 * グリッドのディープコピー
 */
export function deepCopyGrid(grid: Grid): Grid {
  return grid.map(row => 
    row.map(cell => ({ ...cell }))
  );
}

/**
 * セルのfront/back状態を反転
 */
export function flipSide(side: string): string {
  return side === 'front' ? 'back' : 'front';
}

/**
 * 隣接する4方向の座標を取得
 */
export function getNeighbors(point: Point): Point[] {
  return [
    { x: point.x, y: point.y - 1 }, // up
    { x: point.x, y: point.y + 1 }, // down
    { x: point.x - 1, y: point.y }, // left
    { x: point.x + 1, y: point.y }, // right
  ];
}

/**
 * 2つの座標が等しいかチェック
 */
export function pointEquals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * 座標配列に特定の座標が含まれるかチェック
 */
export function pointInArray(point: Point, array: Point[]): boolean {
  return array.some(p => pointEquals(p, point));
}