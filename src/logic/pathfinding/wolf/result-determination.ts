import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { Point } from '../../utils';
import { Candidate } from '../types';

/**
 * オオカミ用の結果判定
 * オオカミがゴールに到達した場合は既存のResult値を使用（失敗判定は上位で処理）
 */
export const determineWolfResult = (
  best: Candidate,
  grid: Grid,
  wolfPosition: Point
): PathResult => {
  // オオカミが本物ゴールに到達した場合
  if (best.kind === 0) {
    return { result: Result.HasClearPath, path: best.path, nextGrid: null };
  }
  
  // ダミーゴールに到達した場合
  if (best.kind === 1) {
    return { result: Result.HasFailPath, path: best.path, nextGrid: null };
  }
  
  // その他の場合（通常は発生しない）
  return { result: Result.NoPath, path: [], nextGrid: null };
};