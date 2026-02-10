import { Grid } from "@/types/grid/schema";
import { deepCopyGrid } from "./utils";

export const swapGridCells = (grid: Grid, pos1: { row: number; col: number }, pos2: { row: number; col: number }): Grid => {
  const newGrid = deepCopyGrid(grid);
  const temp = newGrid[pos1.row][pos1.col];
  newGrid[pos1.row][pos1.col] = newGrid[pos2.row][pos2.col];
  newGrid[pos2.row][pos2.col] = temp;
  return newGrid;
};
