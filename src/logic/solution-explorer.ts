import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement, PhasedSolution } from '@/types/panel-placement';
import { Result, PathResult } from '@/types/path';
// import { findPath } from './pathfinding';
import { evaluateAllPaths } from './pathfinding/wolf-evaluation';
import { placePanels } from './panels';

/** パラメータ */
export interface ExploreParams {
  initialGrid: Grid;
  panels: Panel[];
  allowSkip: boolean;   // true: パネルを全て使わない選択肢を追加
  findAll: boolean;     // false: 最初の解で打ち切り
}

/** 解探索アルゴリズム */
export const exploreSolutions = (opts: ExploreParams): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];
  exploreStep(opts.initialGrid, [opts.initialGrid], [], solutions, opts);
  return solutions;
};

/** DFS探索のステップ関数 */
const exploreStep = (
  currentGrid: Grid, 
  phaseHistory: Grid[], 
  placementHistory: PanelPlacement[][], 
  solutions: PhasedSolution[],
  opts: ExploreParams
): boolean => {
  const { panels, allowSkip } = opts;

  // 各パネルの選択肢を列挙（allowSkip を先頭に）
  let allOptions: (PanelPlacement | null)[][] = panels.map(panel => enumerateSinglePanel(currentGrid, panel));
  if (allowSkip) allOptions = allOptions.map(opts => [null, ...opts]);

  for (const combo of cartesianProduct(...allOptions)) {
    const placements = combo.filter((p): p is PanelPlacement => p !== null);

    // 配置適用
    const [gridAfter, isValid] = placePanels(currentGrid, placements, false);
    if (!isValid) continue;

    // Rest + Wolf 対応のため evaluateAllPaths を使用
    const { startResult, finalResult } = evaluateAllPaths(gridAfter, phaseHistory);
    const path = { ...startResult, result: finalResult }; // PathResultのResult部分だけfinalResultに更新

    // 結果からハンドリング（休憩ならループ続行）
    const shouldStop = handleResult(path, placementHistory, placements, phaseHistory, solutions, opts);
    if (shouldStop) return true;
  }
  return false;
};


/** 無限ループ検知：今のグリッドが過去のフェーズ履歴に存在するか */
const detectInfiniteLoop = (currentGrid: Grid, phaseHistory: Grid[]): boolean =>
  phaseHistory.some(prev => JSON.stringify(prev) === JSON.stringify(currentGrid));

/** Result別の処理ロジック */
const handleResult = (
  pathResult: PathResult,
  placementHistory: PanelPlacement[][],
  placements: PanelPlacement[],
  phaseHistory: Grid[],
  solutions: PhasedSolution[],
  opts: ExploreParams
): boolean => {
  const { findAll } = opts;
  
  switch (pathResult.result) {
    // 終了：解に到達
    case Result.HasClearPath:
      solutions.push({
        phases: [...placementHistory, placements],
        phaseHistory
      });
      return !findAll;

    // 続行：解探索を続ける
    case Result.HasRestPath: {
      const nextGrid = pathResult.nextGrid;
      if (!nextGrid) return false;
      if (detectInfiniteLoop(nextGrid, phaseHistory)) return false;
      return exploreStep(nextGrid, [...phaseHistory, nextGrid], [...placementHistory, placements], solutions, opts);
    }
      
    // 終了: 解ではない
    default:
      return false;
  }
};


/** 1枚のパネルの全配置パターンを列挙 */
export const enumerateSinglePanel = (grid: Grid, panel: Panel): PanelPlacement[] => {
  const gridRows = grid.length;
  const gridCols = grid[0].length;

  // パネル内の最初の黒セル
  let firstBlackX = -1;
  let firstBlackY = -1;
  outerLoop: for (let y = 0; y < panel.cells.length; y++) {
    for (let x = 0; x < panel.cells[y].length; x++) {
      if (panel.cells[y][x] === 'Black') {
        firstBlackX = x;
        firstBlackY = y;
        break outerLoop;
      }
    }
  }
  if (firstBlackX === -1) return [];

  const placements: PanelPlacement[] = [];
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const placement: PanelPlacement = {
        panel,
        highlight: { x: firstBlackX, y: firstBlackY },
        point: { x: gx, y: gy }
      };
      const [, canPlace] = placePanels(grid, [placement], false);
      if (canPlace) placements.push(placement);
    }
  }
  return placements;
};

/** 配列の直積を生成 */
export function* cartesianProduct<T>(...arrays: T[][]): Generator<T[]> {
  if (arrays.length === 0) { yield []; return; }
  const [first, ...rest] = arrays;
  for (const item of first) {
    for (const comb of cartesianProduct(...rest)) yield [item, ...comb];
  }
}

