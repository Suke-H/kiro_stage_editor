import { CELL_TYPES } from "../constants/cell-types";

export type CellType = keyof typeof CELL_TYPES;

export interface Panel {
  id: string;
  cells: CellType[][];
}

export interface PanelPlacementModeType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}

export interface PanelPlacementHistoryType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}
