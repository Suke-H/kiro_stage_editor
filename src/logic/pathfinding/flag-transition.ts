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
  phaseHistory?: Grid[]
): Grid => {
  const newGrid = deepCopyGrid(grid);
  
  // フェーズ履歴から元の状態を判定
  let isStartOriginallyFlag = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      // 元々FlagだったマスをFlagに戻す
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallyFlag = originalCell.type === 'Flag';
    }
  }
  
  // スタート地点の状態変更
  if (isStartOriginallyFlag) {
    // Flag間移動時：前のFlag（現在のStart）をFlagに戻す
    newGrid[start.y][start.x] = { type: 'Flag', side: 'neutral' };
  } else {
    // 初回Flag到達：StartをNormal:frontに変更
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }
  
  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      newGrid[point.y][point.x] = { type: 'Normal', side: 'front' };
    }
  }
  
  // Flag到達時：Normalパネルの状態はそのまま保持（Restと違いリセットしない）
  // パネルの反転状態を維持する
  
  // 到達したFlagを新しいStartに置換
  newGrid[flagPosition.y][flagPosition.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
};