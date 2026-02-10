import { Grid } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { IPanelStrategy } from "./types";

export class SwapFirstStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel | CopyPanel): boolean {
    const cell = grid[rowIdx][colIdx];
    return cell.type !== "Normal" && cell.type !== "Empty";
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel | CopyPanel): [Grid, undefined, { swapAction: string; pos: { row: number; col: number } }] {
    return [grid, undefined, { swapAction: "set", pos: { row: rowIdx, col: colIdx } }];
  }
}
