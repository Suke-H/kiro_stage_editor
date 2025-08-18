import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement, PhasedSolution } from '@/types/panel-placement';
import { Result } from '@/types/path';
import { findPath } from './pathfinding';
import { placePanels } from './panels';
import { solveAllWithRest } from './solver-rest';

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
      
      // 配置可能性をチェック（place_panels内のcanPlaceSingleと同じロジック）
      const [, canPlace] = placePanels(grid, [placement], false);
      if (canPlace) {
        placements.push(placement);
      }
    }
  }
  
  return placements;
};

/**
 * 組み合わせ生成器（Pythonのitertools.productの代替）
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
 * パズル解法の共通処理
 */
const solveCore = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean,
  findAll: boolean
): PanelPlacement[][] => {
  // 各パネルの全配置パターン
  let allOptions: (PanelPlacement | null)[][] = panels.map(panel => 
    enumerateSinglePanel(initialGrid, panel)
  );
  
  // パネルを置かないオプションも許可する場合
  if (allowSkip) {
    allOptions = allOptions.map(options => [null, ...options]);
  }
  
  const solutions: PanelPlacement[][] = [];
  
  for (const combination of cartesianProduct(...allOptions)) {
    // nullを除去して実際の配置のみを取得
    const placements = combination.filter((pl): pl is PanelPlacement => pl !== null);
    
    // 配置適用＆有効判定
    const [gridAfter, isValid] = placePanels(initialGrid, placements, false);
    if (!isValid) {
      continue;
    }
    
    // パス探索
    const pathResult = findPath(gridAfter);
    if (pathResult.result === Result.HasClearPath) {
      solutions.push(placements);
      // 最初の解のみが欲しい場合は早期リターン
      if (!findAll) {
        break;
      }
    }
  }
  
  return solutions;
};

/**
 * クリア可能な最初の配置を探索
 */
export const solveSingle = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true
): PanelPlacement[] | null => {
  const solutions = solveCore(initialGrid, panels, allowSkip, false);
  return solutions.length > 0 ? solutions[0] : null;
};

/**
 * クリア可能な全配置を探索
 */
export const solveAll = (
  initialGrid: Grid,
  panels: Panel[],
  allowSkip: boolean = true
): PanelPlacement[][] => {
  return solveCore(initialGrid, panels, allowSkip, true);
};

/**
 * APIレスポンス形式でのソルバー
 */
export interface SolveResponse {
  solutions: PhasedSolution[];
}

export const solvePuzzle = (grid: Grid, panels: Panel[], minimizePanels: boolean = false): SolveResponse => {
  // Restマスの存在チェック
  const hasRest = grid.some(row => 
    row.some(cell => cell.type === 'Rest')
  );
  
  let solutions: PhasedSolution[];
  
  if (hasRest) {
    solutions = solveAllWithRest(grid, panels);
  } else {
    const normalSolutions = solveAll(grid, panels, true);
    solutions = normalSolutions.map(solution => ({
      phases: [solution], // 1フェーズのみ
      phaseHistory: [grid] // 初期グリッドのみ
    }));
  }
  
  // パネル設置数最小フィルタリング
  if (minimizePanels && solutions.length > 0) {
    const minPanelCount = Math.min(
      ...solutions.map(sol => 
        sol.phases.reduce((total, phase) => total + phase.length, 0)
      )
    );
    solutions = solutions.filter(sol => 
      sol.phases.reduce((total, phase) => total + phase.length, 0) === minPanelCount
    );
  }
  
  return { solutions };
}