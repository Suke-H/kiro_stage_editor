export type CellType = 'white' | 'black' | 'start' | 'goal' | 'obstacle';

export interface Panel {
  id: string;
  cells: CellType[][];
}

export interface CellTypeConfig {
  label: string;
  color: string;
}