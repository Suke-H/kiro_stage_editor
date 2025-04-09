import { CELL_TYPES, CELL_DEFINITIONS } from "../constants/cell-types";

export type CellType = keyof typeof CELL_TYPES
export type CellDefinitions = keyof typeof CELL_DEFINITIONS;

// グリッド上のセルを表す型
export type GridCell = {
  type: CellDefinitions;
  side: 'neutral' | 'front' | 'back';
};

// パネルの型を更新
export interface Panel {
  id: string;
  cells: CellType[][];
}

export type PanelPlacementModeType = {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
};

export type PanelPlacementHistoryType = PanelPlacementModeType[];

// Storeの型定義
export interface CellTypeState {
  selectedCellType: CellDefinitions;
}

export interface PanelListState {
  panels: Panel[];
  removedPanels: { panel: Panel; index: number }[];
}

export interface CreatePanelState {
  newPanelGrid: CellType[][];
}

export interface PanelPlacementState {
  panelPlacementMode: PanelPlacementModeType;
}

export enum StudioMode {
  Editor = 'editor',
  Play = 'play',
  Solver = 'solver'
}

export interface StudioModeState {
  studioMode: StudioMode;
}

export enum StudioModeInEditor {
  Editor = 'editor',
  Play = 'play'
}
export interface StudioModeStateInEditor {
  studioModeInEditor: StudioModeInEditor;
}



export interface GridState {
  grid: GridCell[][];
  gridHistory: GridCell[][][];
}
