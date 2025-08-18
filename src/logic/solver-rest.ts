import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement } from '@/types/panel-placement';
import { PhasedSolution } from '@/types/phased-solution';
import { dfs } from './solver-dfs';

/**
 * 1枚のパネルの全配置パターンを列挙
 */
const enumerateSinglePanel = (grid: Grid, panel: Panel): PanelPlacement[] => {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  
  // パネル内の最初の黒セルを探す
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
  
  // 黒セルが見つからない場合
  if (firstBlackX === -1 || firstBlackY === -1) {
    return [];
  }
  
  const placements: PanelPlacement[] = [];
  
  // グリッド上の全位置を試す
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const placement: PanelPlacement = {
        panel,
        highlight: { x: firstBlackX, y: firstBlackY },
        point: { x: gx, y: gy }
      };
      
      placements.push(placement);
    }
  }
  
  return placements;
};

/**
 * 組み合わせ生成器
 */
function* cartesianProduct<T>(...arrays: T[][]): Generator<T[]> {
  if (arrays.length === 0) {
    yield [];
    return;
  }
  
  const [first, ...rest] = arrays;
  for (const item of first) {
    for (const combination of cartesianProduct(...rest)) {
      yield [item, ...combination];
    }
  }
}

/**
 * Rest対応のsolveAll
 */
export const solveAllWithRest = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true,
  maxDepth: number = 5
): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];

  dfs(
    initialGrid,
    [initialGrid],
    0,
    [],
    solutions,
    enumerateSinglePanel,
    cartesianProduct,
    panels,
    allowSkip,
    maxDepth
  );

  return solutions;
};