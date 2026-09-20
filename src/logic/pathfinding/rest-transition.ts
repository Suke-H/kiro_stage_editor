import { Grid } from '@/types/grid';
import { deepCopyGrid, Point } from '../utils';
import {
  restoreGridCellSwaps,
  restoreGridPositionAfterSwaps,
  SwapOperation,
} from '../grid-utils';

/**
 * Rest到達時の次状態グリッド作成
 */
export const createRestTransitionGrid = (
  grid: Grid, 
  start: Point, 
  restPosition: Point, 
  crowPositions: Set<string>, 
  path: Point[], 
  phaseHistory?: Grid[],
  swapOperations: SwapOperation[] = [],
  phaseStartGrid?: Grid
): Grid => {
  const restorePointAfterSwaps = (point: Point): Point => {
    const restored = restoreGridPositionAfterSwaps(
      { row: point.y, col: point.x },
      swapOperations,
    );
    return { x: restored.col, y: restored.row };
  };

  const resetsToPhaseStart = phaseStartGrid !== undefined;
  const restoredStart = resetsToPhaseStart ? restorePointAfterSwaps(start) : start;
  const restoredRest = resetsToPhaseStart
    ? restorePointAfterSwaps(restPosition)
    : restPosition;
  let newGrid = deepCopyGrid(phaseStartGrid ?? grid);
  
  // フェーズ履歴から元の状態を判定
  let isStartOriginallyRest = false;
  let isStartOriginallySwitch = false;
  let isStartOriginallyPlayerInvertSwitch = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (
      restoredStart.y < previousGrid.length &&
      restoredStart.x < previousGrid[restoredStart.y].length
    ) {
      const originalCell = previousGrid[restoredStart.y][restoredStart.x];
      isStartOriginallyRest = originalCell.type === 'Rest';
      isStartOriginallySwitch = originalCell.type === 'Switch';
      isStartOriginallyPlayerInvertSwitch = originalCell.type === 'PlayerInvertSwitch';
    }
  }

  // スタート地点の状態変更
  if (isStartOriginallyRest) {
    // Rest間移動時：前のRest（現在のStart）をRestに戻す
    newGrid[restoredStart.y][restoredStart.x] = { type: 'Rest', side: 'neutral' };
  } else if (isStartOriginallySwitch) {
    // Switch経由時：前のSwitch（現在のStart）をSwitchOff(back)に戻す
    newGrid[restoredStart.y][restoredStart.x] = { type: 'Switch', side: 'front' };
  } else if (isStartOriginallyPlayerInvertSwitch) {
    // PlayerInvertSwitch経由時：前のPlayerInvertSwitch（現在のStart）をPlayerInvertSwitchに戻す
    newGrid[restoredStart.y][restoredStart.x] = { type: 'PlayerInvertSwitch', side: 'front' };
  } else {
    // 初回Rest到達：StartをNormal:frontに変更
    newGrid[restoredStart.y][restoredStart.x] = { type: 'Normal', side: 'front' };
  }
  
  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      const restoredPoint = resetsToPhaseStart ? restorePointAfterSwaps(point) : point;
      newGrid[restoredPoint.y][restoredPoint.x] = { type: 'Normal', side: 'front' };
    }
  }
  
  // 到達したRestを新しいStartに置換
  newGrid[restoredRest.y][restoredRest.x] = { type: 'Start', side: 'neutral' };

  // このフェーズの入れ替えを逆順に戻す。Restが入れ替えられていた場合はStartも元位置へ戻る
  if (!resetsToPhaseStart) {
    newGrid = restoreGridCellSwaps(newGrid, swapOperations);
  }

  // Rest到達時：Normalパネルのfront/back状態をフェーズ履歴末尾からリセット
  if (!resetsToPhaseStart && phaseHistory && phaseHistory.length > 0) {
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
  
  return newGrid;
};
