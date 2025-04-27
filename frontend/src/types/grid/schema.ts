import { CellDefinitionKey } from '../cell';

export type GridCell = {
  type: CellDefinitionKey;
  side: 'neutral' | 'front' | 'back';
};

export interface GridState {
  grid: GridCell[][];
  gridHistory: GridCell[][][];
}
