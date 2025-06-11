import { Grid } from '@/types/grid';
import { PathResult, Result, Vector } from '@/types/path';
import { Point } from '../utils';
import { createFootprintGrid } from './footprint-grid';
import { createRestTransitionGrid } from './rest-transition';
import { Candidate } from './types';

/**
 * 最終結果を判定して返す
 */
export const determineResult = (
  best: Candidate,
  grid: Grid,
  start: Point,
  totalCrows: number,
  crowPositions: Set<string>,
  phaseHistory?: Grid[]
): PathResult => {
  const vectors: Vector[] = best.path.map(point => ({ x: point.x, y: point.y }));
  
  // 次状態Grid（Rest以外はnull）
  let nextGrid: Grid | null = null;
  let status: Result;
  
  // 判定とステータス設定
  if (best.kind === 0) {
    // 本物ゴール到達
    if (totalCrows === 0 || best.crowCount === totalCrows) {
      // カラスがないか、全カラス通過済み
      status = Result.HasClearPath;
      nextGrid = createFootprintGrid(grid, best.path, phaseHistory);
    } else {
      // 本物ゴールだが全カラス未通過
      status = Result.HasFailPath;
    }
  } else if (best.kind === 2) {
    // Rest到達時の特別処理
    status = Result.HasRestPath;
    const restPosition = best.path[best.path.length - 1];
    nextGrid = createRestTransitionGrid(grid, start, restPosition, crowPositions, best.path, phaseHistory);
  } else {
    // ダミーゴール到達（失敗）
    status = Result.HasFailPath;
  }
  
  return {
    path: vectors,
    result: status,
    nextGrid
  };
};