import { CellType } from '../cell';

export interface Panel {
  id:    string;
  cells: CellType[][];
}
