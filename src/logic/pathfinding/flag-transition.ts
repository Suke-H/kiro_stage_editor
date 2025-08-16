import { Grid } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';

/**
 * Flag到達時の次状態グリッド作成
 */
export const createFlagTransitionGrid = (
  grid: Grid, 
  start: Point, 
  flagPosition: Point, 
  crowPositions: Set<string>, 
  path: Point[], 
): Grid => {
  const newGrid = deepCopyGrid(grid);
  
  // StartをNormal:frontに変更
  newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  
  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      newGrid[point.y][point.x] = { type: 'Normal', side: 'front' };
    }
  }
  
  // Normalパネルの状態はそのまま保持（Restと違いリセットしない）
  // パネルの反転状態を維持する
  
  // 到達したFlagを新しいStartに置換
  newGrid[flagPosition.y][flagPosition.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
};