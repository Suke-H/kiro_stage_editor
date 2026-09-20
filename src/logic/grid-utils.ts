import { Grid } from "@/types/grid/schema";
import { deepCopyGrid } from "./utils";

export interface GridPosition {
  row: number;
  col: number;
}

export interface SwapOperation {
  first: GridPosition;
  second: GridPosition;
  historyDepth: number;
}

export const restoreGridPositionAfterSwaps = (
  position: GridPosition,
  swapOperations: SwapOperation[]
): GridPosition => {
  let restored = { ...position };

  for (const operation of [...swapOperations].reverse()) {
    const isFirst =
      restored.row === operation.first.row && restored.col === operation.first.col;
    const isSecond =
      restored.row === operation.second.row && restored.col === operation.second.col;

    if (isFirst) {
      restored = { ...operation.second };
    } else if (isSecond) {
      restored = { ...operation.first };
    }
  }

  return restored;
};

export const swapGridCells = (grid: Grid, pos1: { row: number; col: number }, pos2: { row: number; col: number }): Grid => {
  const newGrid = deepCopyGrid(grid);
  const temp = newGrid[pos1.row][pos1.col];
  newGrid[pos1.row][pos1.col] = newGrid[pos2.row][pos2.col];
  newGrid[pos2.row][pos2.col] = temp;
  return newGrid;
};

export const restoreGridCellSwaps = (
  grid: Grid,
  swapOperations: SwapOperation[]
): Grid => {
  return [...swapOperations]
    .reverse()
    .reduce(
      (restoredGrid, operation) =>
        swapGridCells(restoredGrid, operation.first, operation.second),
      grid
    );
};
