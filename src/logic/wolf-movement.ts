import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { findAll, deepCopyGrid, pointEquals } from './utils';

/**
 * StartとWolfの移動を統合したnextGridを生成
 * Wolfは移動させるが、Start位置と被る場合は描画しない
 */
export const createCombinedNextGrid = (
  startResult: PathResult,
  wolfResults: PathResult[],
  baseGrid: Grid
): Grid | null => {
  let nextGrid = deepCopyGrid(baseGrid);
  const wolves = findAll(baseGrid, 'Wolf');
  
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
      nextGrid[wolfStartPos.y][wolfStartPos.x] = { type: 'Normal', side: 'front' };
      
      // ②移動先処理
      const wolfEndPos = wolfResult.path[wolfResult.path.length - 1];
      const startEndPos = startResult.path[startResult.path.length - 1];
      
      // Start位置と被らない場合のみWolfを配置
      if (!pointEquals(wolfEndPos, startEndPos)) {
        nextGrid[wolfEndPos.y][wolfEndPos.x] = { type: 'Wolf', side: 'neutral' };
      }
      // 被る場合は何もしない（Start優先でWolf消える）
    }
  }
  
  return nextGrid;
};