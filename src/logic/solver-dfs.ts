import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement, PhasedSolution } from '@/types/panel-placement';
import { Result } from '@/types/path';
import { findPath } from './pathfinding';
import { placePanels } from './panels';

/**
 * 無限ループ検知：今のグリッドが過去のフェーズ履歴に存在するかチェック
 */
const detectInfiniteLoop = (currentGrid: Grid, phaseHistory: Grid[]): boolean => {
  return phaseHistory.some(prevGrid =>
    JSON.stringify(prevGrid) === JSON.stringify(currentGrid)
  );
};

/**
 * Rest対応の深度優先探索
 */
export const dfs = (
  currentGrid: Grid,
  phaseHistory: Grid[],
  placementHistory: PanelPlacement[][],
  solutions: PhasedSolution[],
  enumerateSinglePanel: (grid: Grid, panel: Panel) => PanelPlacement[],
  cartesianProduct: <T>(...arrays: T[][]) => Generator<T[]>,
  panels: Panel[]
): void => {

  // 各パネルの配置パターン（デフォルトでallowSkip）
  const allOptions: (PanelPlacement | null)[][] = panels.map(panel => 
    [null, ...enumerateSinglePanel(currentGrid, panel)]
  );

  for (const combination of cartesianProduct(...allOptions)) {
    const placements = combination.filter((pl): pl is PanelPlacement => pl !== null);

    const [gridAfter, isValid] = placePanels(currentGrid, placements, false);
    if (!isValid) continue;

    const pathResult = findPath(gridAfter, phaseHistory);

    if (pathResult.result === Result.HasClearPath) {
      solutions.push({
        phases: [...placementHistory, placements]
      });
    }

    if (pathResult.result === Result.HasRestPath) {
      const nextGrid = pathResult.nextGrid!;

      // 無限ループ検知
      if (detectInfiniteLoop(nextGrid, phaseHistory)) continue;
      
      dfs(
        nextGrid,
        [...phaseHistory, nextGrid],
        [...placementHistory, placements],
        solutions,
          enumerateSinglePanel,
          cartesianProduct,
          panels
        );
      }
    }
};