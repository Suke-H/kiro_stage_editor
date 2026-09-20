import { Grid, GridCell } from '@/types/grid';
import { GridPosition, swapGridCells } from './grid-utils';
import { deepCopyGrid } from './utils';

export const canSelectFirstSwapTarget = (cell: GridCell): boolean =>
  cell.type !== 'Normal' && cell.type !== 'Empty' && cell.type !== 'Start';

export const canSelectSecondSwapTarget = (cell: GridCell): boolean =>
  canSelectFirstSwapTarget(cell) && cell.type !== 'SwapCell';

export const applySwapPanel = (
  grid: Grid,
  first: GridPosition,
  second: GridPosition,
): Grid => {
  const preparedGrid = deepCopyGrid(grid);

  if (preparedGrid[first.row][first.col].type === 'SwapCell') {
    preparedGrid[first.row][first.col] = { type: 'Normal', side: 'front' };
  }

  return swapGridCells(preparedGrid, first, second);
};
