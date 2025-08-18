import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement } from '@/types/panel-placement';
import { PhasedSolution } from '@/types/phased-solution';
import { Result } from '@/types/path';
import { findPath } from './pathfinding';
import { placePanels } from './panels';

/**
 * Rest対応の深度優先探索
 */
export const dfs = (
  currentGrid: Grid,
  phaseHistory: Grid[],
  depth: number,
  placementHistory: PanelPlacement[][],
  solutions: PhasedSolution[],
  enumerateSinglePanel: (grid: Grid, panel: Panel) => PanelPlacement[],
  cartesianProduct: <T>(...arrays: T[][]) => Generator<T[]>,
  panels: Panel[],
  allowSkip: boolean,
  maxDepth: number
): void => {
  if (depth > maxDepth) return;

  // 各パネルの配置パターン
  let allOptions: (PanelPlacement | null)[][] = panels.map(panel => 
    enumerateSinglePanel(currentGrid, panel)
  );
  
  if (allowSkip) {
    allOptions = allOptions.map(options => [null, ...options]);
  }

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

      const isLoop = phaseHistory.some(prevGrid =>
        JSON.stringify(prevGrid) === JSON.stringify(nextGrid)
      );

      if (!isLoop) {
        dfs(
          nextGrid,
          [...phaseHistory, nextGrid],
          depth + 1,
          [...placementHistory, placements],
          solutions,
          enumerateSinglePanel,
          cartesianProduct,
          panels,
          allowSkip,
          maxDepth
        );
      }
    }
  }
};