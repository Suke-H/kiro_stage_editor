import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { findSingle, findAll, Point } from '../../utils';
import { bfsAllShortestPaths } from '../bfs';
import { Candidate } from '../types';
import { rankWolfCandidates } from './candidate-ranking';
import { determineWolfResult } from './result-determination';

/**
 * オオカミ用の全ての目標地点（Goal/DummyGoal）への経路を収集
 */
const findWolfPaths = (grid: Grid, wolfStart: Point): {
  realPaths: Point[][];
  dummyPaths: Point[][];
} => {
  const goalReal = findSingle(grid, 'Goal');
  const dummyGoals = findAll(grid, 'DummyGoal');
  
  // 最短経路群を取得
  const realPaths = goalReal ? bfsAllShortestPaths(grid, wolfStart, goalReal) : [];
  
  // すべてのDummyGoalに対して最短経路を取得
  const dummyPaths: Point[][] = [];
  for (const dummyGoal of dummyGoals) {
    dummyPaths.push(...bfsAllShortestPaths(grid, wolfStart, dummyGoal));
  }
  
  return { realPaths, dummyPaths };
};

/**
 * オオカミ用の経路候補リストを作成
 */
const createWolfCandidates = (
  realPaths: Point[][],
  dummyPaths: Point[][]
): Candidate[] => {
  const allCandidates: Candidate[] = [];
  
  for (const path of realPaths) {
    allCandidates.push({ path, kind: 0, crowCount: 0 });
  }
  for (const path of dummyPaths) {
    allCandidates.push({ path, kind: 1, crowCount: 0 });
  }
  
  return allCandidates;
};

/**
 * オオカミ経路探索メイン関数
 * 優先度: 最短経路 → 本物ゴール優先
 */
export const findWolfPath = (grid: Grid, wolfPosition: Point): PathResult => {
  // 1. 基本要素の検証
  const goalReal = findSingle(grid, 'Goal');
  if (!goalReal)
    return { result: Result.NoGoal, path: [], nextGrid: null};

  // 2. 全経路の収集
  const { realPaths, dummyPaths } = findWolfPaths(grid, wolfPosition);
  
  // 3. 候補リストの作成
  const allCandidates = createWolfCandidates(realPaths, dummyPaths);
  if (allCandidates.length === 0)
    return { result: Result.NoPath, path: [], nextGrid: null };
  
  // 4. 候補のソート
  const sortedCandidates = rankWolfCandidates(allCandidates);
  
  // 5. 最終結果の判定
  const best = sortedCandidates[0];
  return determineWolfResult(best, grid, wolfPosition);
};