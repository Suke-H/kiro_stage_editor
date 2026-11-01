import { Grid } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { PanelPlacement, PhasedSolution, PhaseGrids } from "@/types/panel-placement";
import { Result, PathResult } from "@/types/path";
// import { findPath } from './pathfinding';
import { evaluateAllPaths } from "./pathfinding/wolf-evaluation";
import { placePanels, canPlaceSinglePanel } from "./panels";
import { filterDuplicateSolutions } from "./filter-duplicate-solutions";
import { SwapOperation } from "./grid-utils";
import {
  applySwapPanel,
  canSelectFirstSwapTarget,
  canSelectSecondSwapTarget,
} from "./swap-panel-operations";
import { createCombinedNextGrid } from "./wolf-movement";
import { PanelInventory } from "@/types/panel-inventory";
import {
  collectPlacedFlagInInventory,
  createPanelInventory,
  placePanelInInventory,
  resetPanelInventory,
} from "./panel-inventory";

/** パラメータ */
export interface ExploreParams {
  initialGrid: Grid;
  panels: Panel[];
  findAll: boolean; // false: 最初の解で打ち切り
}

/** パズル問題の定義 */
interface PuzzleProblemSet {
  grid: Grid;
  phaseHistory: Grid[];
  placementHistory: PanelPlacement[][];
  phaseGrids: PhaseGrids[];
  panelInventory: PanelInventory;
  copyPanels: CopyPanel[];
  swapOperations: SwapOperation[];
  phaseStartGrid: Grid;
  canPlacePanels: boolean; // 旗・スイッチ到達後はゴールか休憩までパネル配置不可
}

/** 解探索アルゴリズム */
export const exploreSolutions = (opts: ExploreParams): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];
  const visitedPhaseStates = new Set<string>([
    createStateKey(opts.initialGrid, createPanelInventory(opts.panels), [], []),
  ]);

  const puzzleSetGroup: PuzzleProblemSet[] = [
    {
      grid: opts.initialGrid,
      phaseHistory: [opts.initialGrid],
      placementHistory: [],
      phaseGrids: [],
      panelInventory: createPanelInventory(opts.panels),
      copyPanels: [],
      swapOperations: [],
      phaseStartGrid: opts.initialGrid,
      canPlacePanels: true,
    },
  ];

  while (puzzleSetGroup.length > 0) {
    const puzzleSet = puzzleSetGroup.pop()!;
    const results = exploreStep(
      puzzleSet.grid,
      puzzleSet.panelInventory,
      puzzleSet.copyPanels,
      puzzleSet.phaseHistory,
      puzzleSet.swapOperations,
      puzzleSet.phaseStartGrid,
      puzzleSet.canPlacePanels,
    );

    const processed = handleResult(
      results,
      puzzleSet,
      opts.findAll,
      visitedPhaseStates,
    );
    solutions.push(...processed.newSolutions);
    puzzleSetGroup.push(...processed.newPuzzleSetGroup);

    if (processed.shouldStop) {
      return solutions;
    }
  }

  return filterDuplicateSolutions(solutions);
};

/** 探索結果の型 */
interface StepResult {
  pathResult: PathResult;
  wolfResults: PathResult[];
  placements: PanelPlacement[];
  finalGrid: Grid; // パネル配置後のグリッド
  panelInventory: PanelInventory;
  copyPanels: CopyPanel[];
  swapOperations: SwapOperation[];
}

/** placePanels の戻り値（生成パネルの有無でユニオン） */
type PlacePanelsReturn =
  | [Grid, boolean]
  | [Grid, boolean, { copyPanel: CopyPanel }];

function hasCopyPanel(
  ret: PlacePanelsReturn
): ret is [Grid, boolean, { copyPanel: CopyPanel }] {
  return ret.length === 3;
}

/** 1ステップ：順序つき・1枚ずつ置く（0枚＝何もしない も含め全組み合わせを評価） */
const exploreStep = (
  currentGrid: Grid,
  panelInventory: PanelInventory,
  currentCopyPanels: CopyPanel[],
  phaseHistory: Grid[],
  initialSwapOperations: SwapOperation[],
  phaseStartGrid: Grid,
  canPlacePanels: boolean,
): StepResult[] => {
  const results: StepResult[] = [];

  type State = {
    grid: Grid;
    panelInventory: PanelInventory;
    copyPanels: CopyPanel[];
    seq: PanelPlacement[];   // 置いた順序の履歴（= placements）
    swapOperations: SwapOperation[];
  };

  // 初期状態（このフェーズの開始点）
  const worklist: State[] = [
    {
      grid: currentGrid,
      panelInventory,
      copyPanels: currentCopyPanels,
      seq: [],
      swapOperations: initialSwapOperations,
    },
  ];

  const visitedStates = new Set<string>();

  while (worklist.length > 0) {
    // 現在の状態を取り出す
    const state = worklist.pop()!;
    // 置き順や同形パネルの違いだけの状態は評価済みなのでスキップ
    const stateKey = createStateKey(state.grid, state.panelInventory, state.copyPanels, state.swapOperations);
    if (visitedStates.has(stateKey)) continue;
    visitedStates.add(stateKey);
    // 評価
    const { startResult, wolfResults, finalResult } = evaluateAllPaths(
      state.grid,
      phaseHistory,
      state.swapOperations,
      phaseStartGrid,
    );
    const pathResult = { ...startResult, result: finalResult };
    
    // パネル配置後のグリッド（state.gridは既に配置後）
    const finalGrid = state.grid;
    
    results.push({
      pathResult,
      wolfResults,
      placements: state.seq,
      finalGrid,
      panelInventory: state.panelInventory,
      copyPanels: state.copyPanels,
      swapOperations: state.swapOperations,
    });
    if (!canPlacePanels) continue;
    // アクション実施
    const nextStates = handleAction(state);
    // 組み合わせを追加
    for (const ns of nextStates) worklist.push(ns);
  }

  return results;
};

/** アクション： 在庫にあるパネルを1枚取り出して設置した結果をすべて生成
 * 置いた後にGrid反映
 * 置いたパネルを減らす
 * Cutを設置した場合、CopyPanelを在庫に追加
*/
function handleAction(state: {
  grid: Grid;
  panelInventory: PanelInventory;
  copyPanels: CopyPanel[];
  seq: PanelPlacement[];
  swapOperations: SwapOperation[];
}): Array<{
  grid: Grid;
  panelInventory: PanelInventory;
  copyPanels: CopyPanel[];
  seq: PanelPlacement[];
  swapOperations: SwapOperation[];
}> {
  const out: Array<{
    grid: Grid;
    panelInventory: PanelInventory;
    copyPanels: CopyPanel[];
    seq: PanelPlacement[];
    swapOperations: SwapOperation[];
  }> = [];

  // 在庫から1枚ずつ取り出して配置
  const panels = [...state.panelInventory.panels, ...state.copyPanels];
  for (const panel of panels) {
    if (panel.type === "Swap") {
      const panelInventoryAfterPlacement = placePanelInInventory(state.panelInventory, panel as Panel);
      for (const placement of enumerateSwapPanelPlacements(state.grid, panel)) {
        const secondPoint = placement.secondPoint!;
        const first = { row: placement.point.y, col: placement.point.x };
        const second = { row: secondPoint.y, col: secondPoint.x };
        out.push({
          grid: applySwapPanel(state.grid, first, second),
          panelInventory: panelInventoryAfterPlacement,
          copyPanels: state.copyPanels,
          seq: [...state.seq, placement],
          swapOperations: [
            ...state.swapOperations,
            { first, second, historyDepth: state.seq.length + 1 },
          ],
        });
      }
      continue;
    }

    // 配置できる場所を列挙
    const placements = enumerateSinglePanel(state.grid, panel);
    if (placements.length === 0) continue;
    // 各配置候補に対して配置実施
    for (const placement of placements) {
      const ret = placePanels(state.grid, [placement], false) as PlacePanelsReturn;
      const gridAfter = ret[0];
      const isValid = ret[1];
      if (!isValid) continue;

      // 在庫更新：使った1枚を消費し、Cutなら生成されたCopyを在庫に加える
      const isCopyPanel = panel.type === "Paste";
      const panelInventoryAfterPlacement = isCopyPanel
        ? state.panelInventory
        : placePanelInInventory(state.panelInventory, panel as Panel);
      const copyPanelsAfterPlacement = isCopyPanel
        ? state.copyPanels.filter((copyPanel) => copyPanel.id !== panel.id)
        : state.copyPanels;
      const generated = hasCopyPanel(ret) ? [ret[2].copyPanel] : [];

      out.push({
        grid: gridAfter,
        panelInventory: panelInventoryAfterPlacement,
        copyPanels: [...copyPanelsAfterPlacement, ...generated],
        seq: [...state.seq, placement], // 順序を保持
        swapOperations: state.swapOperations,
      });
    }
  }

  return out;
}

const enumerateSwapPanelPlacements = (
  grid: Grid,
  panel: Panel | CopyPanel,
): PanelPlacement[] => {
  const placements: PanelPlacement[] = [];

  for (let firstY = 0; firstY < grid.length; firstY++) {
    for (let firstX = 0; firstX < grid[firstY].length; firstX++) {
      const firstCell = grid[firstY][firstX];
      if (!canSelectFirstSwapTarget(firstCell)) continue;
      // 入れ替えマスは消費されるため (A,B) と (B,A) で結果が異なるが、それ以外は同じ結果になる
      const isFirstSwapCell = firstCell.type === 'SwapCell';

      for (let secondY = 0; secondY < grid.length; secondY++) {
        for (let secondX = 0; secondX < grid[secondY].length; secondX++) {
          if (firstX === secondX && firstY === secondY) continue;
          const secondCell = grid[secondY][secondX];
          if (!canSelectSecondSwapTarget(secondCell)) continue;
          if (!isFirstSwapCell) {
            // (B,A) は (A,B) と同じ結果なので片方のみ列挙
            if (secondY < firstY || (secondY === firstY && secondX < firstX)) continue;
            // 同じ中身のマス同士の入れ替えは盤面が変わらないので除外
            if (firstCell.type === secondCell.type && firstCell.side === secondCell.side) continue;
          }

          placements.push({
            panel,
            highlight: { x: 0, y: 0 },
            point: { x: firstX, y: firstY },
            secondPoint: { x: secondX, y: secondY },
          });
        }
      }
    }
  }

  return placements;
};


/** パネルの形状キー（同形パネルはIDが違っても同じとみなす） */
const panelShapeKey = (panel: Panel | CopyPanel): string =>
  `${panel.type}:${JSON.stringify(panel.cells)}`;

/**
 * 探索状態を識別するキー
 * ボード・手元のパネル・貼付パネル・入替の記録が同じなら、置き順や同形パネルの違いは同じ状態とみなす
 */
const createStateKey = (
  grid: Grid,
  panelInventory: PanelInventory,
  copyPanels: CopyPanel[],
  swapOperations: SwapOperation[],
): string => JSON.stringify({
  grid,
  availablePanels: panelInventory.panels.map(panelShapeKey).sort(),
  removedPanels: panelInventory.removedPanels
    .map(({ panel, isCollected }) => `${panelShapeKey(panel)}:${isCollected}`)
    .sort(),
  copyPanels: copyPanels.map(panelShapeKey).sort(),
  swaps: swapOperations.map(({ first, second }) => [first, second]),
});

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
  findAll: boolean,
  visitedPhaseStates: Set<string>,
): ProcessResult => {
  const newSolutions: PhasedSolution[] = [];
  const newPuzzleSetGroup: PuzzleProblemSet[] = [];

  for (const result of results) {
    switch (result.pathResult.result) {
      case Result.HasClearPath:
        newSolutions.push({
          phases: [...current.placementHistory, result.placements],
          phaseHistory: current.phaseHistory,
          phaseGrids: [...current.phaseGrids, {
            before: current.grid,
            after: result.finalGrid
          }],
        });
        if (!findAll)
          return { shouldStop: true, newSolutions, newPuzzleSetGroup };
        break;

      case Result.HasRestPath: {
        const transitionGrid = result.pathResult.nextGrid;
        const nextGrid = transitionGrid
          ? createCombinedNextGrid(
              result.pathResult,
              result.wolfResults,
              transitionGrid,
              result.finalGrid,
              result.swapOperations,
              true,
            )
          : null;

        if (nextGrid) {
          const panelInventory = resetPanelInventory(result.panelInventory);
          const stateKey = createStateKey(nextGrid, panelInventory, [], []);
          if (visitedPhaseStates.has(stateKey)) break;
          visitedPhaseStates.add(stateKey);

          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: [...current.phaseHistory, nextGrid],
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [...current.phaseGrids, {
              before: current.grid,
              after: result.finalGrid
            }],
            panelInventory,
            copyPanels: [],
            swapOperations: [],
            phaseStartGrid: nextGrid,
            canPlacePanels: true,
          });
        }
        break;
      }

      case Result.HasFlagPath: {
        const transitionGrid = result.pathResult.nextGrid;
        const nextGrid = transitionGrid
          ? createCombinedNextGrid(
              result.pathResult,
              result.wolfResults,
              transitionGrid,
              result.finalGrid,
            )
          : null;

        if (nextGrid) {
          const panelInventory = collectPlacedFlagInInventory(result.panelInventory);
          // Flag効果発動後のnextGridで継続探索
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: current.phaseHistory,
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [...current.phaseGrids, {
              before: current.grid,
              after: result.finalGrid
            }],
            panelInventory,
            copyPanels: result.copyPanels,
            swapOperations: result.swapOperations,
            phaseStartGrid: current.phaseStartGrid,
            canPlacePanels: false,
          });
        }
        break;
      }

      case Result.HasSwitchPath: {
        const transitionGrid = result.pathResult.nextGrid;
        const nextGrid = transitionGrid
          ? createCombinedNextGrid(
              result.pathResult,
              result.wolfResults,
              transitionGrid,
              result.finalGrid,
            )
          : null;

        if (nextGrid) {
          // Switch効果発動後のnextGridで継続探索
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: current.phaseHistory,
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [...current.phaseGrids, {
              before: current.grid,
              after: result.finalGrid
            }],
            panelInventory: result.panelInventory,
            copyPanels: result.copyPanels,
            swapOperations: result.swapOperations,
            phaseStartGrid: current.phaseStartGrid,
            canPlacePanels: false,
          });
        }
        break;
      }

      // その他（NoPath等）は何もしない
    }
  }

  return { shouldStop: false, newSolutions, newPuzzleSetGroup };
};

/** パネル内の最初の配置対象セル（BlackまたはFlag）を取得 */
const findHighlightCell = (panel: Panel | CopyPanel): { x: number; y: number } | null => {
  for (let y = 0; y < panel.cells.length; y++) {
    for (let x = 0; x < panel.cells[y].length; x++) {
      const cell = panel.cells[y][x];
      switch (panel.type) {
        case "Cut":
        case "Normal":
          if (typeof cell === 'string' && cell === "Black") {
            return { x, y };
          }
          break;
        case "Flag":
          if (typeof cell === 'string' && cell === "Flag") {
            return { x, y };
          }
          break;
        case "Paste":
          if (typeof cell === 'object' && cell.type !== "Empty") {
            return { x, y };
          }
          break;
      }
    }
  }
  return null;
};

/** 1枚のパネルの全配置パターンを列挙 */
export const enumerateSinglePanel = (
  grid: Grid,
  panel: Panel | CopyPanel
): PanelPlacement[] => {
  const gridRows = grid.length;
  const gridCols = grid[0].length;

  const highlight = findHighlightCell(panel);
  if (!highlight) 
  {
    console.log(`最初のターゲットセルが見つかりませんでした: ${JSON.stringify(panel)}`);
    return [];
  }

  const placements: PanelPlacement[] = [];
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const placement: PanelPlacement = {
        panel,
        highlight: highlight,
        point: { x: gx, y: gy },
      };
      if (canPlaceSinglePanel(grid, placement)) {
        placements.push(placement);
      }
    }
  }
  return placements;
};

