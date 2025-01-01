export type CellType =  'empty' | 'white' | 'black' | 'start' | 'goal' | 'dummy-goal' | 'crow';

export interface Panel {
  id: string;
  cells: CellType[][];
}
export interface CellTypeConfig {
  label: string;
  color: string;
  code: string;
}

export interface PanelPlacementModeType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}

export interface PanelPlacementHistoryType {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}
