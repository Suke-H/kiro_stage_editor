import { CellDefinitionKey } from '../cell';

export type GridCell = {
  type: CellDefinitionKey;
  side: 'neutral' | 'front' | 'back';
};

export type Grid = GridCell[][];

export interface GridState {
  grid: Grid;
  gridHistory: Grid[];
}
