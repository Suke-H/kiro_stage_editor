export type CellDefinitionKey =
  | 'Flip'
  | 'Empty'
  | 'Normal'
  | 'Start'
  | 'Goal'
  | 'DummyGoal'
  | 'Crow'
  | 'Wolf'
  | 'Warp'
  | 'ArrowUpDown'
  | 'ArrowRightLeft'
  | 'Rest';

export type GridCell = {
  type: CellDefinitionKey;
  side: 'neutral' | 'front' | 'back';
};

export type Grid = GridCell[][];

export interface GridState {
  grid: Grid;
  gridHistory: Grid[];
}
