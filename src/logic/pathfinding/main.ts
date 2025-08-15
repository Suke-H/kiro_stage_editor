import { Grid } from '@/types/grid';
import { PathResult, Result } from '@/types/path';
import { findSingle, findAll, Point } from '../utils';
import { bfsAllShortestPaths } from './bfs';
import { Candidate } from './types';
import { rankCandidates } from './candidate-ranking';
import { determineResult } from './result-determination';

/**
 * 全ての目標地点（Goal/DummyGoal/Rest/Flag）への経路を収集
 */
const findAllPaths = (grid: Grid, start: Point): {
  realPaths: Point[][];
  dummyPaths: Point[][];
  restPaths: Point[][];
  flagPaths: Point[][];
} => {
  const goalReal = findSingle(grid, 'Goal');
  const dummyGoals = findAll(grid, 'DummyGoal');
  const restPositions = findAll(grid, 'Rest');
  const flagPositions = findAll(grid, 'Flag');
  
  // 最短経路群を取得
  const realPaths = goalReal ? bfsAllShortestPaths(grid, start, goalReal) : [];
  
  // すべてのDummyGoalに対して最短経路を取得
  const dummyPaths: Point[][] = [];
  for (const dummyGoal of dummyGoals) {
    dummyPaths.push(...bfsAllShortestPaths(grid, start, dummyGoal));
  }
  
  // すべてのRestに対して最短経路を取得
  const restPaths: Point[][] = [];
  for (const rest of restPositions) {
    restPaths.push(...bfsAllShortestPaths(grid, start, rest));
  }
  
  // すべてのFlagに対して最短経路を取得
  const flagPaths: Point[][] = [];
  for (const flag of flagPositions) {
    flagPaths.push(...bfsAllShortestPaths(grid, start, flag));
  }
  
  return { realPaths, dummyPaths, restPaths, flagPaths };
};

/**
 * 経路候補リストを作成
 */
const createCandidates = (
  realPaths: Point[][],
  dummyPaths: Point[][],
  restPaths: Point[][],
  flagPaths: Point[][]
): Candidate[] => {
  const allCandidates: Candidate[] = [];
  
  for (const path of realPaths) {
    allCandidates.push({ path, kind: 0, crowCount: 0 });
  }
  for (const path of dummyPaths) {
    allCandidates.push({ path, kind: 1, crowCount: 0 });
  }
  for (const path of restPaths) {
    allCandidates.push({ path, kind: 2, crowCount: 0 });
  }
  for (const path of flagPaths) {
    allCandidates.push({ path, kind: 3, crowCount: 0 });
  }
  
  return allCandidates;
};

/**
 * グリッド内の全カラス位置を収集
 */
const searchCrowPositions = (grid: Grid): Set<string> => {
  const crowPositions = new Set<string>();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].type === 'Crow') {
        crowPositions.add(`${x},${y}`);
      }
    }
  }
  return crowPositions;
};



/**
 * パズル経路探索メイン関数
 * 優先度: 最短経路 → 本物ゴール優先 → 通過カラス数多い順
 * クリア条件: 本物ゴールに到達かつステージ内の全カラスを通過
 */
export const findPath = (grid: Grid, phaseHistory?: Grid[]): PathResult => {
  // 1. 基本要素の検証
  const start = findSingle(grid, 'Start');
  const goalReal = findSingle(grid, 'Goal');
  if (!start)
    return { result: Result.NoStart, path: [], nextGrid: null };
  if (!goalReal)
    return { result: Result.NoGoal, path: [], nextGrid: null};

  // 2. 全経路の収集
  const { realPaths, dummyPaths, restPaths, flagPaths } = findAllPaths(grid, start);
  
  // 3. 候補リストの作成
  const allCandidates = createCandidates(realPaths, dummyPaths, restPaths, flagPaths);
  if (allCandidates.length === 0)
    return { result: Result.NoPath, path: [], nextGrid: null };
  
  // 4. カラス位置の収集
  const crowPositions = searchCrowPositions(grid);
  const totalCrows = crowPositions.size;
  
  // 5. 候補の処理とソート
  const sortedCandidates = rankCandidates(allCandidates, crowPositions);
  
  // 6. 最終結果の判定
  const best = sortedCandidates[0];
  return determineResult(best, grid, start, totalCrows, crowPositions, phaseHistory);
};