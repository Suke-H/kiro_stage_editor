import { Grid } from '@/types/grid';
import { PathResult, Result, Vector } from '@/types/path';
import { findSingle, findAll, Point } from '../utils';
import { bfsAllShortestPaths } from './bfs';
import { createFootprintGrid } from './footprint-grid';
import { createRestTransitionGrid } from './rest-transition';

/**
 * パズル経路探索メイン関数
 * 優先度: 最短経路 → 本物ゴール優先 → 通過カラス数多い順
 * クリア条件: 本物ゴールに到達かつステージ内の全カラスを通過
 */
export const findPath = (grid: Grid, phaseHistory?: Grid[]): PathResult => {
  // Start が無ければ即終了
  const start = findSingle(grid, 'Start');
  if (!start) {
    return {
      result: Result.NoStart,
      path: [],
      nextGrid: null
    };
  }
  
  // Goal / DummyGoal / Rest を検出
  const goalReal = findSingle(grid, 'Goal');
  const dummyGoals = findAll(grid, 'DummyGoal');
  const restPositions = findAll(grid, 'Rest');
  
  // Goal が無ければ即終了
  if (!goalReal) {
    return {
      result: Result.NoGoal,
      path: [],
      nextGrid: null
    };
  }
  
  // 最短経路群を取得
  const realPaths = bfsAllShortestPaths(grid, start, goalReal);
  
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
  
  // 候補リスト作成
  interface Candidate {
    path: Point[];
    kind: number; // 0: real goal, 1: dummy goal, 2: rest
    crowCount: number;
  }
  
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
  
  if (allCandidates.length === 0) {
    return {
      result: Result.NoPath,
      path: [],
      nextGrid: null
    };
  }
  
  // ステージ内の全カラス位置
  const crowPositions = new Set<string>();
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].type === 'Crow') {
        crowPositions.add(`${x},${y}`);
      }
    }
  }
  const totalCrows = crowPositions.size;
  
  // 各候補にカラス数を付与
  for (const candidate of allCandidates) {
    candidate.crowCount = candidate.path.filter(point => 
      crowPositions.has(`${point.x},${point.y}`)
    ).length;
  }
  
  // ソート: 経路長 → 本物ゴール優先 → カラス多い順
  allCandidates.sort((a, b) => {
    // 経路長で比較
    if (a.path.length !== b.path.length) {
      return a.path.length - b.path.length;
    }
    // 種類で比較（0(real) < 1(dummy) < 2(rest)）
    if (a.kind !== b.kind) {
      return a.kind - b.kind;
    }
    // カラス数で比較（多い順）
    return b.crowCount - a.crowCount;
  });
  
  const best = allCandidates[0];
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