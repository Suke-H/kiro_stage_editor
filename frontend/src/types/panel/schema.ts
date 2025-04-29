export type CellType =
  | 'White' 
  | 'Black' 

export interface Panel {
  id:    string;
  cells: CellType[][];
}
