import { Grid } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { PanelPlacement, PhasedSolution, PhaseGrids } from "@/types/panel-placement";
import { Result, PathResult } from "@/types/path";
// import { findPath } from './pathfinding';
import { evaluateAllPaths } from "./pathfinding/wolf-evaluation";
import { placePanels, canPlaceSinglePanel } from "./panels";

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
  availablePanels: Panel[];
}

/** 解探索アルゴリズム */
export const exploreSolutions = (opts: ExploreParams): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];

  const puzzleSetGroup: PuzzleProblemSet[] = [
    {
      grid: opts.initialGrid,
      phaseHistory: [opts.initialGrid],
      placementHistory: [],
      phaseGrids: [],
      availablePanels: opts.panels,
    },
  ];

  while (puzzleSetGroup.length > 0) {
    const puzzleSet = puzzleSetGroup.pop()!;
    const results = exploreStep(
      puzzleSet.grid,
      puzzleSet.availablePanels,
      puzzleSet.phaseHistory
    );

    const processed = handleResult(
      results,
      puzzleSet,
      opts.panels,
      opts.findAll
    );
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
  finalGrid: Grid; // パネル配置後のグリッド
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
  availablePanels: Panel[],
  phaseHistory: Grid[]
): StepResult[] => {
  const results: StepResult[] = [];

  type State = {
    grid: Grid;
    inventory: (Panel | CopyPanel)[];      // パネル在庫（Cutで生成されたCopyもここに入る）
    seq: PanelPlacement[];   // 置いた順序の履歴（= placements）
  };

  // 初期状態（このフェーズの開始点）
  const worklist: State[] = [
    { grid: currentGrid, inventory: availablePanels, seq: [] },
  ];

  while (worklist.length > 0) {
    // 現在の状態を取り出す
    const state = worklist.pop()!;
    // 評価
    const { startResult, finalResult } = evaluateAllPaths(state.grid, phaseHistory);
    const pathResult = { ...startResult, result: finalResult };
    
    // パネル配置後のグリッド（state.gridは既に配置後）
    const finalGrid = state.grid;
    
    results.push({ pathResult, placements: state.seq, finalGrid });
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
  inventory: (Panel | CopyPanel)[];
  seq: PanelPlacement[];
}): Array<{ grid: Grid; inventory: (Panel | CopyPanel)[]; seq: PanelPlacement[] }> {
  const out: Array<{ grid: Grid; inventory: (Panel | CopyPanel)[]; seq: PanelPlacement[] }> = [];

  // 在庫から1枚ずつ取り出して配置
  for (const panel of state.inventory) {

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
      const remaining = state.inventory.filter((p) => p.id !== panel.id);
      const generated = hasCopyPanel(ret) ? [ret[2].copyPanel] : [];

      out.push({
        grid: gridAfter,
        inventory: [...remaining, ...generated],
        seq: [...state.seq, placement], // 順序を保持
      });
    }
  }

  return out;
}


/** 無限ループ検知：今のグリッドが過去のフェーズ履歴に存在するか */
const detectInfiniteLoop = (currentGrid: Grid, phaseHistory: Grid[]): boolean =>
  phaseHistory.some(
    (prev) => JSON.stringify(prev) === JSON.stringify(currentGrid)
  );

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
        const nextGrid = result.pathResult.nextGrid;
        if (nextGrid && !detectInfiniteLoop(nextGrid, current.phaseHistory)) {
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: [...current.phaseHistory, nextGrid],
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [...current.phaseGrids, {
              before: current.grid,
              after: result.finalGrid
            }],
            availablePanels: allPanels,
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
            phaseGrids: [...current.phaseGrids, {
              before: current.grid,
              after: result.finalGrid
            }],
            availablePanels: [], // Flag到達で全パネル破棄
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

