import { Grid, GridCellKey } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';

/**
 * クリア時の足跡描画グリッド作成
 */
export const createFootprintGrid = (grid: Grid, path: Point[], phaseHistory?: Grid[]): Grid => {
  const newGrid = deepCopyGrid(grid);
  
  // スタート地点の処理
  const start = path[0];
  
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
    // Rest経由でのクリア：元のRest（現在のStart）をRestに戻す
    newGrid[start.y][start.x] = { type: 'Rest', side: 'neutral' };
  } else {
    // 初回クリア：StartをNormal:frontに変更
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }
  
  // 足跡描画（最初と最後を除く）
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    
    let footprintType: GridCellKey | null = null;
    if (dx === 1 && dy === 0) {
      footprintType = 'FootRight';
    } else if (dx === -1 && dy === 0) {
      footprintType = 'FootLeft';
    } else if (dx === 0 && dy === 1) {
      footprintType = 'FootDown';
    } else if (dx === 0 && dy === -1) {
      footprintType = 'FootUp';
    }
    
    if (footprintType) {
      newGrid[curr.y][curr.x] = { type: footprintType, side: 'neutral' };
    }
  }
  
  // ゴール地点にキャラクター（Start）を配置
  const goal = path[path.length - 1];
  newGrid[goal.y][goal.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
};