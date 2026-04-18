import { Grid } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';

/**
 * Switch到達時の次状態グリッド作成
 */
export const createSwitchTransitionGrid = (
  grid: Grid,
  start: Point,
  switchPosition: Point,
  crowPositions: Set<string>,
  path: Point[],
  phaseHistory?: Grid[]
): Grid => {
  const newGrid = deepCopyGrid(grid);

  // phaseHistoryから元のStart位置の種別を確認
  let isStartOriginallySwitch = false;
  let isStartOriginallyInvertSwitch = false;
  let isStartOriginallyPlayerInvertSwitch = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallySwitch = originalCell.type === 'Switch';
      isStartOriginallyInvertSwitch = originalCell.type === 'InvertSwitch';
      isStartOriginallyPlayerInvertSwitch = originalCell.type === 'PlayerInvertSwitch';
    }
  }

  // スタート地点の状態変更
  if (isStartOriginallySwitch) {
    newGrid[start.y][start.x] = { type: 'Switch', side: 'front' };
  } else if (isStartOriginallyInvertSwitch) {
    newGrid[start.y][start.x] = { type: 'InvertSwitch', side: 'front' };
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

  // Wall(back=閉) → Wall(front=開)
  for (let y = 0; y < newGrid.length; y++) {
    for (let x = 0; x < newGrid[y].length; x++) {
      if (newGrid[y][x].type === 'Wall' && newGrid[y][x].side === 'back') {
        newGrid[y][x] = { type: 'Wall', side: 'front' };
      }
    }
  }

  // 到達したSwitchを新しいStartに置換
  newGrid[switchPosition.y][switchPosition.x] = { type: 'Start', side: 'neutral' };

  return newGrid;
};
