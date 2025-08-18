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

/** パズル問題の定義 */
interface PuzzleProblemSet {
  grid: Grid;
  phaseHistory: Grid[];
  placementHistory: PanelPlacement[][];
  availablePanels: Panel[];
}

/** 解探索アルゴリズム */
export const exploreSolutions = (opts: ExploreParams): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];
  
  const puzzleSetGroup: PuzzleProblemSet[] = [{
    grid: opts.initialGrid,
    phaseHistory: [opts.initialGrid],
    placementHistory: [],
    availablePanels: opts.panels
  }];
  
  while (puzzleSetGroup.length > 0) {
    const puzzleSet = puzzleSetGroup.pop()!;
    const results = exploreStep(puzzleSet.grid, puzzleSet.availablePanels, opts.allowSkip);
    
    const processed = handleResult(results, puzzleSet, opts.panels, opts.findAll);
    solutions.push(...processed.newSolutions);
    puzzleSetGroup.push(...processed.newPuzzleSetGroup);

    if (processed.shouldStop) {
      return solutions;
    }
  }
  
  return solutions;
};

/** 探索結果の型 */
interface StepResult {
  pathResult: PathResult;
  placements: PanelPlacement[];
}

/** 1ステップの探索（パネル組み合わせを試すだけ） */
const exploreStep = (
  currentGrid: Grid, 
  availablePanels: Panel[],
  allowSkip: boolean
): StepResult[] => {
  // console.log('=== exploreStep開始 ===');
  // console.log('availablePanels:', availablePanels.map(p => `${p.id}(${p.type || 'Normal'})`));
  
  const results: StepResult[] = [];

  // 各パネルの配置選択肢を列挙（allowSkip時は「置かない」選択肢も追加）
  let panelChoices: (PanelPlacement | null)[][] = availablePanels.map(panel => enumerateSinglePanel(currentGrid, panel));
  if (allowSkip) panelChoices = panelChoices.map(choices => [null, ...choices]);

  for (const combo of cartesianProduct(...panelChoices)) {
    const placements = combo.filter((p): p is PanelPlacement => p !== null);
    // console.log('試行中のplacements:', placements.map(p => `${p.panel.id}(${p.panel.type || 'Normal'})@highlight(${p.highlight.x},${p.highlight.y})->point(${p.point.x},${p.point.y})`));

    // 配置適用
    const [gridAfter, isValid] = placePanels(currentGrid, placements, false);
    if (!isValid) {
      console.log('  -> 配置無効');
      continue;
    }

    // Rest + Wolf 対応のため evaluateAllPaths を使用
    const { startResult, finalResult } = evaluateAllPaths(gridAfter, [currentGrid]);
    const pathResult = { ...startResult, result: finalResult };
    
    // console.log('  -> pathResult:', finalResult, 'nextGrid有無:', !!pathResult.nextGrid);

    results.push({ pathResult, placements });
  }
  
  return results;
};


/** 無限ループ検知：今のグリッドが過去のフェーズ履歴に存在するか */
const detectInfiniteLoop = (currentGrid: Grid, phaseHistory: Grid[]): boolean =>
  phaseHistory.some(prev => JSON.stringify(prev) === JSON.stringify(currentGrid));

/** 処理結果の型 */
interface ProcessResult {
  shouldStop: boolean;
  newSolutions: PhasedSolution[];
  newPuzzleSetGroup: PuzzleProblemSet[];
}

/** 結果処理全体を関数化 */
const handleResult = (
  results: StepResult[],
  current: PuzzleProblemSet,
  allPanels: Panel[],
  findAll: boolean
): ProcessResult => {
  const newSolutions: PhasedSolution[] = [];
  const newPuzzleSetGroup: PuzzleProblemSet[] = [];
  
  for (const result of results) {
    switch (result.pathResult.result) {
      case Result.HasClearPath:
        newSolutions.push({
          phases: [...current.placementHistory, result.placements],
          phaseHistory: current.phaseHistory
        });
        if (!findAll) return { shouldStop: true, newSolutions, newPuzzleSetGroup };
        break;
        
      case Result.HasRestPath: {
        const nextGrid = result.pathResult.nextGrid;
        if (nextGrid && !detectInfiniteLoop(nextGrid, current.phaseHistory)) {
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: [...current.phaseHistory, nextGrid],
            placementHistory: [...current.placementHistory, result.placements],
            availablePanels: allPanels
          });
        }
        break;
      }
        
      case Result.HasFlagPath: {
        const nextGrid = result.pathResult.nextGrid;
        
        if (nextGrid) {
          // Flag効果発動後のnextGridで継続探索
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: current.phaseHistory,
            placementHistory: [...current.placementHistory, result.placements],
            availablePanels: [] // Flag到達で全パネル破棄
          });
        }
        break;
      }
        
      // その他（NoPath等）は何もしない
    }
  }
  
  return { shouldStop: false, newSolutions, newPuzzleSetGroup };
};



/** 1枚のパネルの全配置パターンを列挙 */
export const enumerateSinglePanel = (grid: Grid, panel: Panel): PanelPlacement[] => {
  const gridRows = grid.length;
  const gridCols = grid[0].length;

  // パネル内の最初の配置対象セル（BlackまたはFlag）
  let firstTargetX = -1;
  let firstTargetY = -1;
  outerLoop: for (let y = 0; y < panel.cells.length; y++) {
    for (let x = 0; x < panel.cells[y].length; x++) {
      if (panel.cells[y][x] === 'Black' || panel.cells[y][x] === 'Flag') {
        firstTargetX = x;
        firstTargetY = y;
        break outerLoop;
      }
    }
  }
  if (firstTargetX === -1) return [];

  const placements: PanelPlacement[] = [];
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const placement: PanelPlacement = {
        panel,
        highlight: { x: firstTargetX, y: firstTargetY },
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

