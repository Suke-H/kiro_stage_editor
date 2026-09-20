import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { findAll, findSingle, deepCopyGrid, pointEquals } from './utils';
import { restoreGridPositionAfterSwaps, SwapOperation } from './grid-utils';

/**
 * StartとWolfの移動を統合したnextGridを生成
 * ダミーゴールへ到達したWolfは消滅させ、ダミーゴールは残す
 */
export const createCombinedNextGrid = (
  startResult: PathResult,
  wolfResults: PathResult[],
  baseGrid: Grid,
  wolfSourceGrid: Grid = baseGrid,
  swapOperations: SwapOperation[] = [],
  restoreSwaps: boolean = false,
): Grid | null => {
  const nextGrid = deepCopyGrid(baseGrid);
  const wolves = findAll(wolfSourceGrid, 'Wolf');

  const mapPoint = (point: { x: number; y: number }) => {
    if (!restoreSwaps) return point;
    const restored = restoreGridPositionAfterSwaps(
      { row: point.y, col: point.x },
      swapOperations,
    );
    return { x: restored.col, y: restored.row };
  };
  
  for (let i = 0; i < wolfResults.length && i < wolves.length; i++) {
    const wolfResult = wolfResults[i];
    const wolfStartPos = wolves[i];
    
    // NoPathの場合は何もしない（Wolfそのまま）
    if (wolfResult.result === Result.NoPath) {
      continue;
    }
    
    // 移動する場合のみ処理
    if (wolfResult.path.length > 0) {
      // ①Wolf開始位置をNormal:frontに
      const mappedWolfStartPos = mapPoint(wolfStartPos);
      if (nextGrid[mappedWolfStartPos.y][mappedWolfStartPos.x].type === 'Wolf') {
        nextGrid[mappedWolfStartPos.y][mappedWolfStartPos.x] = { type: 'Normal', side: 'front' };
      }

      // ダミーゴールへ到達したWolfは配置し直さない（ダミーゴールを残す）
      if (wolfResult.result === Result.HasFailPath) {
        continue;
      }
      
      // ②移動先処理
      const wolfEndPos = mapPoint(wolfResult.path[wolfResult.path.length - 1]);
      
      // Start位置を取得（移動する場合は最終位置、しない場合は元の位置）
      const startPos = startResult.path.length > 0 
        ? startResult.path[startResult.path.length - 1]
        : findSingle(baseGrid, 'Start');
      
      // Start位置と被らない場合のみWolfを配置
      if (!startPos || !pointEquals(wolfEndPos, startPos)) {
        nextGrid[wolfEndPos.y][wolfEndPos.x] = { type: 'Wolf', side: 'neutral' };
      }
      // 被る場合は何もしない（Start優先でWolf消える）
    }
  }
  
  return nextGrid;
};
