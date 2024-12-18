export type CellType = 'white' | 'black' | 'start' | 'goal' | 'obstacle';

export interface Panel {
  id: string;
  cells: CellType[][];
}
export interface CellTypeConfig {
  label: string;
  color: string;
}

export interface PanelPlacementModeType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}

export interface PanelPlacementHistoryType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}
