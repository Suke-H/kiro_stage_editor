import { Panel } from '../panel';
import { CellDefinitionKey, CellType } from '../cell';

export interface CellTypeState {
  selectedCellType: CellDefinitionKey;
}

export interface PanelListState {
  panels: Panel[];
  removedPanels: { panel: Panel; index: number }[];
}

export interface CreatePanelState {
  newPanelGrid: CellType[][]
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
  Editor = 'editor',
  Play   = 'play',
  Solver = 'solver',
}

export enum StudioModeInEditor {
  Editor = 'editor',
  Play = 'play'
}

export interface StudioModeState {
  studioMode: StudioMode;
}

export interface StudioModeStateInEditor {
  studioModeInEditor: StudioModeInEditor;
}
