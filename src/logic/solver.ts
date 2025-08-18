import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement, PhasedSolution } from '@/types/panel-placement';
import { exploreSolutions } from './solution-explorer';


/** 最初の解 */
export const solveSingle = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true
): PanelPlacement[] | null => {
  const sols = exploreSolutions({
    initialGrid, panels, allowSkip, findAll: false
  });
  return sols.length ? sols[0].phases[0] : null;
};

/** すべての解 */
export const solveAll = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true
): PanelPlacement[][] => {
  const sols = exploreSolutions({
    initialGrid, panels, allowSkip, findAll: true
  });
  // Rest 無しなら各解は 1 フェーズになるので先頭を返す
  return sols.map(s => s.phases[0]);
};

/** 全探索 */
export const solveAllWithRest = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true
): PhasedSolution[] => {
  return exploreSolutions({
    initialGrid, panels, allowSkip, findAll: true
  });
};

/** API レスポンス形式 */
export interface SolveResponse {
  solutions: PhasedSolution[];
}

/** パズル解法（最小パネル数で絞り込み対応） */
export const solvePuzzle = (
  grid: Grid,
  panels: Panel[],
  minimizePanels: boolean = false
): SolveResponse => {
  // Rest マスの有無
  const hasRest = grid.some(row => row.some(cell => cell.type === 'Rest'));

  let solutions: PhasedSolution[];
  if (hasRest) {
    solutions = solveAllWithRest(grid, panels, true);
  } else {
    const normal = solveAll(grid, panels, true);
    solutions = normal.map(solution => ({
      phases: [solution],        // 単フェーズとして格納
      phaseHistory: [grid]       // 初期グリッドのみ
    }));
  }

  // パネル枚数最小化
  if (minimizePanels && solutions.length) {
    const count = (sol: PhasedSolution) =>
      sol.phases.reduce((t, ph) => t + ph.length, 0);
    const minCnt = Math.min(...solutions.map(count));
    solutions = solutions.filter(s => count(s) === minCnt);
  }

  return { solutions };
};
