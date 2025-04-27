import { Panel } from '../panel';
import { CellDefinitionKey } from '../cell';

export interface CellTypeState {
  selectedCellType: CellDefinitionKey;
}

export interface PanelListState {
  panels: Panel[];
  removedPanels: { panel: Panel; index: number }[];
}

export interface CreatePanelState {
  newPanelGrid: string[][]; // or CellType[][]
}

export interface PanelPlacementMode {
  panel: Panel | null;
  highlightedCell: { row: number; col: number } | null;
}

export interface PanelPlacementState {
  panelPlacementMode: PanelPlacementMode;
}

// export interface GridState {
//   grid: { type: CellDefinitionKey; side: 'neutral' | 'front' | 'back' }[][];
//   gridHistory: any[];
// }

export enum StudioMode {
  Editor = 'editor',
  Play   = 'play',
  Solver = 'solver',
}

export interface StudioModeState {
  studioMode: StudioMode;
}
