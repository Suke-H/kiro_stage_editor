import { Grid, GridCellKey } from '@/types/grid';
import { PathResult, Result, Vector } from '@/types/path';
import { deepCopyGrid, findSingle, findAll, inBounds, isPassable, pointEquals, Point } from './utils';

const DIRECTIONS: Point[] = [
  { x: -1, y: 0 }, // left
  { x: 1, y: 0 },  // right
  { x: 0, y: -1 }, // up
  { x: 0, y: 1 },  // down
];

/**
 * BFS実装用のキュー
 */
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * start→goalへの全最短経路を取得
 */
function bfsAllShortestPaths(grid: Grid, start: Point, goal: Point): Point[][] {
  const dist = new Map<string, number>();
  const parents = new Map<string, Point[]>();
  
  const pointToKey = (p: Point): string => `${p.x},${p.y}`;
  // const keyToPoint = (key: string): Point => {
  //   const [x, y] = key.split(',').map(Number);
  //   return { x, y };
  // };
  
  const startKey = pointToKey(start);
  // const goalKey = pointToKey(goal);
  
  dist.set(startKey, 0);
  const queue = new Queue<Point>();
  queue.enqueue(start);
  
  let goalDistance = -1;
  
  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    const currentKey = pointToKey(current);
    const currentDist = dist.get(currentKey)!;
    
    // ゴール到達時の距離を記録
    if (pointEquals(current, goal)) {
      goalDistance = currentDist;
      break;
    }
    
    for (const direction of DIRECTIONS) {
      const next: Point = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };
      
      if (!inBounds(next, grid) || !isPassable(grid[next.y][next.x])) {
        continue;
      }
      
      const nextKey = pointToKey(next);
      const nextDist = currentDist + 1;
      
      if (!dist.has(nextKey)) {
        // 未訪問
        dist.set(nextKey, nextDist);
        parents.set(nextKey, [current]);
        queue.enqueue(next);
      } else if (dist.get(nextKey) === nextDist) {
        // 同距離での訪問（最短経路の一部）
        const existing = parents.get(nextKey) || [];
        existing.push(current);
        parents.set(nextKey, existing);
      }
    }
  }
  
  // ゴールに到達できない場合
  if (goalDistance === -1) {
    return [];
  }
  
  // 経路再構築
  const paths: Point[][] = [];
  
  function buildPaths(current: Point, path: Point[]): void {
    if (pointEquals(current, start)) {
      paths.push([...path, current].reverse());
      return;
    }
    
    const currentKey = pointToKey(current);
    const parentList = parents.get(currentKey) || [];
    
    for (const parent of parentList) {
      buildPaths(parent, [...path, current]);
    }
  }
  
  buildPaths(goal, []);
  return paths;
}

/**
 * クリア時の足跡描画グリッド作成
 */
function createFootprintGrid(grid: Grid, path: Point[], phaseHistory?: Grid[]): Grid {
  const newGrid = deepCopyGrid(grid);
  
  // スタート地点の処理
  const start = path[0];
  
  // フェーズ履歴から元の状態を判定
  let isStartOriginallyRest = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallyRest = originalCell.type === 'Rest';
    }
  }
  
  // スタート地点の状態変更
  if (isStartOriginallyRest) {
    // Rest経由でのクリア：元のRest（現在のStart）をRestに戻す
    newGrid[start.y][start.x] = { type: 'Rest', side: 'neutral' };
  } else {
    // 初回クリア：StartをNormal:frontに変更
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }
  
  // 足跡描画（最初と最後を除く）
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    
    let footprintType: GridCellKey | null = null;
    if (dx === 1 && dy === 0) {
      footprintType = 'FootRight';
    } else if (dx === -1 && dy === 0) {
      footprintType = 'FootLeft';
    } else if (dx === 0 && dy === 1) {
      footprintType = 'FootDown';
    } else if (dx === 0 && dy === -1) {
      footprintType = 'FootUp';
    }
    
    if (footprintType) {
      newGrid[curr.y][curr.x] = { type: footprintType, side: 'neutral' };
    }
  }
  
  // ゴール地点にキャラクター（Start）を配置
  const goal = path[path.length - 1];
  newGrid[goal.y][goal.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
}

/**
 * Rest到達時の次状態グリッド作成
 */
function createRestTransitionGrid(
  grid: Grid, 
  start: Point, 
  restPosition: Point, 
  crowPositions: Set<string>, 
  path: Point[], 
  phaseHistory?: Grid[]
): Grid {
  const newGrid = deepCopyGrid(grid);
  
  // フェーズ履歴から元の状態を判定
  let isStartOriginallyRest = false;
  if (phaseHistory && phaseHistory.length >= 2) {
    const previousGrid = phaseHistory[phaseHistory.length - 2];
    if (start.y < previousGrid.length && start.x < previousGrid[start.y].length) {
      const originalCell = previousGrid[start.y][start.x];
      isStartOriginallyRest = originalCell.type === 'Rest';
    }
  }
  
  // スタート地点の状態変更
  if (isStartOriginallyRest) {
    // Rest間移動時：前のRest（現在のStart）をRestに戻す
    newGrid[start.y][start.x] = { type: 'Rest', side: 'neutral' };
  } else {
    // 初回Rest到達：StartをNormal:frontに変更
    newGrid[start.y][start.x] = { type: 'Normal', side: 'front' };
  }
  
  // 通過したCrowをNormal:frontに置き換え
  for (const point of path) {
    const pointKey = `${point.x},${point.y}`;
    if (crowPositions.has(pointKey)) {
      newGrid[point.y][point.x] = { type: 'Normal', side: 'front' };
    }
  }
  
  // Rest到達時：Normalパネルのfront/back状態をフェーズ履歴末尾からリセット
  if (phaseHistory && phaseHistory.length > 0) {
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
  
  // 到達したRestを新しいStartに置換
  newGrid[restPosition.y][restPosition.x] = { type: 'Start', side: 'neutral' };
  
  return newGrid;
}

/**
 * パズル経路探索メイン関数
 * 優先度: 最短経路 → 本物ゴール優先 → 通過カラス数多い順
 * クリア条件: 本物ゴールに到達かつステージ内の全カラスを通過
 */
export function findPath(grid: Grid, phaseHistory?: Grid[]): PathResult {
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
  if (best.kind === 0 && best.crowCount === totalCrows) {
    // 本物ゴール到達 & 全カラス通過
    status = Result.HasClearPath;
    nextGrid = createFootprintGrid(grid, best.path, phaseHistory);
  } else if (best.kind === 2) {
    // Rest到達時の特別処理
    status = Result.HasRestPath;
    const restPosition = best.path[best.path.length - 1];
    nextGrid = createRestTransitionGrid(grid, start, restPosition, crowPositions, best.path, phaseHistory);
  } else {
    // その他（失敗）
    status = Result.HasFailPath;
  }
  
  return {
    path: vectors,
    result: status,
    nextGrid
  };
}