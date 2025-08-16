import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { findPath } from './main';
import { findWolfPath } from './wolf';
import { findAll } from '../utils';

/**
 * Wolf対応の統合判定関数
 */
export const evaluateAllPaths = (grid: Grid, phaseHistory?: Grid[]): {
  startResult: PathResult;
  wolfResults: PathResult[];
  finalResult: Result;
} => {
  // 1. Startの経路取得
  const startResult = findPath(grid, phaseHistory);
  
  // 2. 全Wolfの経路取得
  const wolves = findAll(grid, 'Wolf');
  const wolfResults: PathResult[] = [];
  
  for (let i = 0; i < wolves.length; i++) {
    const wolfResult = findWolfPath(grid, wolves[i]);
    wolfResults.push(wolfResult);
  }
  
  // 3. 最終結果判定
  const finalResult = determineFinalResult(startResult, wolfResults);
  
  return { startResult, wolfResults, finalResult };
};

/**
 * 最終結果判定ロジック
 */
const determineFinalResult = (startResult: PathResult, wolfResults: PathResult[]): Result => {
  // Wolfが本物ゴールに到達した場合は失敗
  for (const wolfResult of wolfResults) {
    if (wolfResult.result === Result.HasClearPath) {
      return Result.WolfReachedGoal;
    }
  }
  
  // 全Wolfが阻まれ、Startの結果を返す
  return startResult.result;
};