import { Grid } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';

/**
 * Rest到達時の次状態グリッド作成
 */
export const createRestTransitionGrid = (
  grid: Grid, 
  start: Point, 
  restPosition: Point, 
  crowPositions: Set<string>, 
  path: Point[], 
  phaseHistory?: Grid[]
): Grid => {
  const newGrid = deepCopyGrid(grid);
  
  // フェーズ履歴から元の状態を判定
  let isStartOriginallyRest = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallyRest = originalCell.type === 'Rest';
    }
  }
  
  // スタート地点の状態変更
  if (isStartOriginallyRest) {
    // Rest間移動時：前のRest（現在のStart）をRestに戻す
    newGrid[start.y][start.x] = { type: 'Rest', side: 'neutral' };
  } else {
    // 初回Rest到達：StartをNormal:frontに変更
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }
  
  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      newGrid[point.y][point.x] = { type: 'Normal', side: 'front' };
    }
  }
  
  // Rest到達時：Normalパネルのfront/back状態をフェーズ履歴末尾からリセット
  if (phaseHistory && phaseHistory.length > 0) {
    const latestGrid = phaseHistory[phaseHistory.length - 1];
    for (let y = 0; y < newGrid.length; y++) {
      for (let x = 0; x < newGrid[y].length; x++) {
        if (newGrid[y][x].type === 'Normal' && 
            latestGrid[y][x].type === 'Normal') {
          // フェーズ履歴末尾からNormalパネルのside状態を復元
          newGrid[y][x].side = latestGrid[y][x].side;
        }
      }
    }
  }
  
  // 到達したRestを新しいStartに置換
  newGrid[restPosition.y][restPosition.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
};