import { Grid } from "../grid";
import { Panel } from "../panel";
import { GridCellKey } from "@/types/grid";
import { PanelCellTypeKey } from "@/types/panel";
import { NumberGrid } from "@/types/solution";
import { PanelPlacement } from "@/types/panel-placement";

export interface GridState {
  grid: Grid;
  gridHistory: Grid[];
}

export interface CellTypeState {
  selectedCellType: GridCellKey;
}

export interface PanelListState {
  panels: Panel[];
  removedPanels: { panel: Panel; index: number }[];
}

export interface CreatePanelState {
  newPanelGrid: PanelCellTypeKey[][];
}

export interface PanelPlacementMode {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}

export type PanelPlacementModeType = {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
};

export interface PanelPlacementState {
  panelPlacementMode: PanelPlacementMode;
}

export enum StudioMode {
  Editor = "editor",
  Play = "play",
  Solver = "solver",
}

export enum StudioModeInEditor {
  Editor = "editor",
  Play = "play",
}

export interface StudioModeState {
  studioMode: StudioMode;
}

export interface StudioModeStateInEditor {
  studioModeInEditor: StudioModeInEditor;
}

export interface SolutionState {
  /** サーバから返ってきた解の配列 */
  solutions: PanelPlacement[][];
  /** 何通り目をプレビュー中か (-1 = 未選択) */
  currentIndex: number;
  /** 現在の解をグリッドに投影した 2D 数字オーバレイ */
  numberGrid: NumberGrid;
}
