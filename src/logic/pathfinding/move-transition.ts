import { Grid } from "@/types/grid";
import { deepCopyGrid, Point } from "../utils";

const getOriginalCell = (phaseHistory: Grid[] | undefined, point: Point) => {
  if (!phaseHistory || phaseHistory.length < 2) return null;

  const previousGrid = phaseHistory[phaseHistory.length - 2];
  if (point.y >= previousGrid.length || point.x >= previousGrid[point.y].length) {
    return null;
  }

  return previousGrid[point.y][point.x];
};

export const createMoveTransitionGrid = (
  grid: Grid,
  source: Point,
  destination: Point,
  phaseHistory?: Grid[]
): Grid => {
  const newGrid = deepCopyGrid(grid);
  const movingCell = grid[source.y][source.x];
  const originalSourceCell = getOriginalCell(phaseHistory, source);

  if (originalSourceCell) {
    newGrid[source.y][source.x] = { ...originalSourceCell };
  } else {
    newGrid[source.y][source.x] = { type: "Normal", side: "front" };
  }

  newGrid[destination.y][destination.x] = { ...movingCell };

  return newGrid;
};
