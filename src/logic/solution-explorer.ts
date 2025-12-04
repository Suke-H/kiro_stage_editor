import { Grid } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { PanelPlacement, PhasedSolution, PhaseGrids } from "@/types/panel-placement";
import { Result, PathResult } from "@/types/path";
// import { findPath } from './pathfinding';
import { evaluateAllPaths } from "./pathfinding/wolf-evaluation";
import { placePanels, canPlaceSinglePanel } from "./panels";
import { filterDuplicateSolutions } from "./filter-duplicate-solutions";
import * as fs from 'fs';

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

const tag = (phase: number, depth: number): string => {
  return "[P" + phase + "][d" + depth + "]";
};

/** ログ収集 */
let debugLogs: string[] = [];

export const getDebugLogs = () => debugLogs;
export const clearDebugLogs = () => { debugLogs = []; };
export const saveDebugLogsToFile = (filename = 'solver-debug.log') => {
  fs.writeFileSync(filename, debugLogs.join('\n'));
  console.log(`ログを ${filename} に保存しました`);
};

/** 解探索アルゴリズム（最小ログ付き） */
export const exploreSolutions = (opts: ExploreParams): PhasedSolution[] => {
  const solutions: PhasedSolution[] = [];
  let iterationCount = 0;
  const MAX_ITERATIONS = 1000;
  
  const log = (message: string) => {
    debugLogs.push(message);
    console.log(message);
    // 毎回ログファイルを上書き保存（無限ループ対策）
    fs.writeFileSync('solver-realtime.log', debugLogs.join('\n'));
  };
  const tag = (phase: number, depth: number) =>
    "[P" + phase + "][d" + depth + "]";

  const puzzleSetGroup: PuzzleProblemSet[] = [
    {
      grid: opts.initialGrid,
      phaseHistory: [opts.initialGrid],
      placementHistory: [],
      phaseGrids: [],
      availablePanels: opts.panels,
    },
  ];

  log(`=== ソルバー開始（最大反復回数: ${MAX_ITERATIONS}） ===`);

  while (puzzleSetGroup.length > 0) {
    iterationCount++;
    
    if (iterationCount > MAX_ITERATIONS) {
      log(`❌ 最大反復回数 ${MAX_ITERATIONS} に達しました`);
      log(`現在のキュー長: ${puzzleSetGroup.length}`);
      saveDebugLogsToFile('solver-max-iterations.log');
      break;
    }
    
    if (iterationCount % 50 === 0) {
      log(`⏱️ 反復回数: ${iterationCount}/${MAX_ITERATIONS}, キュー長: ${puzzleSetGroup.length}`);
    }
    const puzzleSet = puzzleSetGroup.pop() as PuzzleProblemSet;
    const phaseIndex = puzzleSet.phaseHistory.length - 1;
    log(tag(phaseIndex, 0) + " start phase");

    const results = exploreStep(
      puzzleSet.grid,
      puzzleSet.availablePanels,
      puzzleSet.phaseHistory,
      phaseIndex,
      log
    );

    const processed = handleResult(
      results,
      puzzleSet,
      opts.panels,
      opts.findAll,
      log
    );
    solutions.push(...processed.newSolutions);
    puzzleSetGroup.push(...processed.newPuzzleSetGroup);

    if (processed.shouldStop) {
      log(`✅ 解発見により探索終了（反復回数: ${iterationCount}）`);
      return solutions;
    }
  }

  log(`=== ソルバー終了（総反復回数: ${iterationCount}） ===`);
  log(`発見した解の数: ${solutions.length}`);
  
  return filterDuplicateSolutions(solutions);
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

/** 型ガード */
function hasCopyPanel(
  ret: PlacePanelsReturn
): ret is [Grid, boolean, { copyPanel: CopyPanel }] {
  return ret.length === 3;
}

/** 1ステップ：順序つき・1枚ずつ置く */
const exploreStep = (
  currentGrid: Grid,
  availablePanels: Panel[],
  phaseHistory: Grid[],
  phaseIndex: number,
  log: (s: string) => void
): StepResult[] => {
  const results: StepResult[] = [];

  type State = {
    grid: Grid;
    inventory: (Panel | CopyPanel)[];
    seq: PanelPlacement[];
  };

  const worklist: State[] = [
    { grid: currentGrid, inventory: availablePanels, seq: [] },
  ];

  while (worklist.length > 0) {
    const state = worklist.pop() as State;
    const depth = state.seq.length;

    const { startResult, finalResult } = evaluateAllPaths(
      state.grid,
      phaseHistory
    );
    const pathResult: PathResult = { ...startResult, result: finalResult };
    log(tag(phaseIndex, depth) + " eval -> " + Result[pathResult.result]);

    const finalGrid = state.grid;
    results.push({ pathResult, placements: state.seq, finalGrid });

    const nextStates = handleAction(state, phaseIndex, log);
    for (const ns of nextStates) worklist.push(ns);
  }

  return results;
};

/** アクション展開 */
function handleAction(
  state: {
    grid: Grid;
    inventory: (Panel | CopyPanel)[];
    seq: PanelPlacement[];
  },
  phaseIndex: number,
  log: (s: string) => void
): Array<{ grid: Grid; inventory: (Panel | CopyPanel)[]; seq: PanelPlacement[] }> {
  const out: Array<{
    grid: Grid;
    inventory: (Panel | CopyPanel)[];
    seq: PanelPlacement[];
  }> = [];

  for (const panel of state.inventory) {
    const placements = enumerateSinglePanel(state.grid, panel);
    if (placements.length === 0) continue;

    for (const placement of placements) {
      const ret = placePanels(state.grid, [placement], false) as PlacePanelsReturn;
      const gridAfter = ret[0];
      const isValid = ret[1];

      const depth = state.seq.length;
      const where = "@ (" + placement.point.x + "," + placement.point.y + ")";
      log(
        tag(phaseIndex, depth) +
          " place " +
          panel.type +
          "#" +
          panel.id +
          " " +
          where +
          " -> " +
          (isValid ? "OK" : "NG")
      );

      if (!isValid) continue;

      const remaining = state.inventory.filter((p) => p.id !== panel.id);
      const generated = hasCopyPanel(ret) ? [ret[2].copyPanel] : [];

      out.push({
        grid: gridAfter,
        inventory: [...remaining, ...generated],
        seq: [...state.seq, placement],
      });
    }
  }

  return out;
}

/** 無限ループ検知 */
const detectInfiniteLoop = (currentGrid: Grid, phaseHistory: Grid[]): boolean =>
  phaseHistory.some(
    (prev) => JSON.stringify(prev) === JSON.stringify(currentGrid)
  );

/** 処理結果 */
interface ProcessResult {
  shouldStop: boolean;
  newSolutions: PhasedSolution[];
  newPuzzleSetGroup: PuzzleProblemSet[];
}

/** 結果処理 */
const handleResult = (
  results: StepResult[],
  current: PuzzleProblemSet,
  allPanels: Panel[],
  findAll: boolean,
  log: (s: string) => void
): ProcessResult => {
  const newSolutions: PhasedSolution[] = [];
  const newPuzzleSetGroup: PuzzleProblemSet[] = [];
  const phaseIndex = current.phaseHistory.length - 1;

  for (const result of results) {
    const depth = result.placements.length;

    switch (result.pathResult.result) {
      case Result.HasClearPath: {
        log(tag(phaseIndex, depth) + " clear (placements=" + depth + ")");
        newSolutions.push({
          phases: [...current.placementHistory, result.placements],
          phaseHistory: current.phaseHistory,
          phaseGrids: [
            ...current.phaseGrids,
            { before: current.grid, after: result.finalGrid },
          ],
        });
        if (!findAll) {
          return { shouldStop: true, newSolutions, newPuzzleSetGroup };
        }
        break;
      }

      case Result.HasRestPath: {
        const nextGrid = result.pathResult.nextGrid;
        if (nextGrid && !detectInfiniteLoop(nextGrid, current.phaseHistory)) {
          log(
            tag(phaseIndex, depth) +
              " next phase -> P" +
              (phaseIndex + 1) +
              " (RestPath)"
          );
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: [...current.phaseHistory, nextGrid],
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [
              ...current.phaseGrids,
              { before: current.grid, after: result.finalGrid },
            ],
            availablePanels: allPanels,
          });
        }
        break;
      }

      case Result.HasFlagPath: {
        const nextGrid = result.pathResult.nextGrid;
        if (nextGrid) {
          log(
            tag(phaseIndex, depth) +
              " next phase -> P" +
              (phaseIndex + 1) +
              " (FlagPath)"
          );
          newPuzzleSetGroup.push({
            grid: nextGrid,
            phaseHistory: current.phaseHistory,
            placementHistory: [...current.placementHistory, result.placements],
            phaseGrids: [
              ...current.phaseGrids,
              { before: current.grid, after: result.finalGrid },
            ],
            availablePanels: [],
          });
        }
        break;
      }

      default:
        break;
    }
  }

  return { shouldStop: false, newSolutions, newPuzzleSetGroup };
};

/** パネル内の最初の配置対象セルを取得 */
const findHighlightCell = (
  panel: Panel | CopyPanel
): { x: number; y: number } | null => {
  for (let y = 0; y < panel.cells.length; y++) {
    for (let x = 0; x < panel.cells[y].length; x++) {
      const cell = panel.cells[y][x];
      switch (panel.type) {
        case "Cut":
        case "Normal":
          if (typeof cell === "string" && cell === "Black") {
            return { x, y };
          }
          break;
        case "Flag":
          if (typeof cell === "string" && cell === "Flag") {
            return { x, y };
          }
          break;
        case "Paste":
          if (typeof cell === "object" && cell.type !== "Empty") {
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
  if (!highlight) {
    console.log(
      "最初のターゲットセルが見つかりませんでした: " + JSON.stringify(panel)
    );
    return [];
  }

  const placements: PanelPlacement[] = [];
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const placement: PanelPlacement = {
        panel,
        highlight,
        point: { x: gx, y: gy },
      };
      if (canPlaceSinglePanel(grid, placement)) {
        placements.push(placement);
      }
    }
  }
  return placements;
};
