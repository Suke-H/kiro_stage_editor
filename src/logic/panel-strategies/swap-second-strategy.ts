import { Grid } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { IPanelStrategy } from "./types";
import { swapGridCells } from "@/logic/grid-utils";
import { store } from "@/store";

export class SwapSecondStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel | CopyPanel): boolean {
    const cell = grid[rowIdx][colIdx];
    return cell.type !== "Normal" && cell.type !== "Empty";
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel | CopyPanel): [Grid, undefined, { swapAction: string }] {
    const swapState = store.getState().swap;
    const swapTarget = swapState.swapTarget;
    if (!swapTarget) throw new Error("SwapSecondStrategy called without swapTarget");
    const newGrid = swapGridCells(grid, swapTarget, { row: rowIdx, col: colIdx });
    return [newGrid, undefined, { swapAction: "clear" }];
  }
}
