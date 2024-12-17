export type CellType = 'white' | 'black' | 'start' | 'goal' | 'obstacle';

export type Panel = {
  id: string;
  cells: CellType[][];
};
