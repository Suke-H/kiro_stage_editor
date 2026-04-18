import { Grid } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';

/**
 * PlayerInvertSwitch到達時の次状態グリッド作成
 * - Startのfront/backを反転
 * - 他のセルには影響しない
 */
export const createPlayerInvertSwitchTransitionGrid = (
  grid: Grid,
  start: Point,
  switchPosition: Point,
  crowPositions: Set<string>,
  path: Point[],
  phaseHistory?: Grid[]
): Grid => {
  const newGrid = deepCopyGrid(grid);

  // phaseHistoryから元のStart位置の種別を確認
  let isStartOriginallyRest = false;
  let isStartOriginallyPlayerInvertSwitch = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallyRest = originalCell.type === 'Rest';
      isStartOriginallyPlayerInvertSwitch = originalCell.type === 'PlayerInvertSwitch';
    }
  }

  // スタート地点の状態変更
  if (isStartOriginallyRest) {
    newGrid[start.y][start.x] = { type: 'Rest', side: 'neutral' };
  } else if (isStartOriginallyPlayerInvertSwitch) {
    newGrid[start.y][start.x] = { type: 'PlayerInvertSwitch', side: 'front' };
  } else {
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }

  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      newGrid[point.y][point.x] = { type: 'Normal', side: 'front' };
    }
  }

  // Startのfront/backを反転
  if (grid[start.y][start.x].side === 'front') {
    newGrid[switchPosition.y][switchPosition.x] = { type: 'Start', side: 'back' };
  } else if (grid[start.y][start.x].side === 'back') {
    newGrid[switchPosition.y][switchPosition.x] = { type: 'Start', side: 'front' };
  } else {
    newGrid[switchPosition.y][switchPosition.x] = { type: 'Start', side: 'neutral' };
  }

  return newGrid;
};
