import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid } from '../utils';

/**
 * Flagパネル用Strategy
 * 1マスをFlagセルに変換
 */
export class FlagPanelStrategy implements IPanelStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canPlace(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel): boolean {
    const targetCell = grid[rowIdx][colIdx];
    // Flagパネルは Normal かつ front側にのみ配置可能
    return targetCell.type === "Normal" && targetCell.side === "front";
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): [Grid, undefined, undefined] {
    const newGrid = deepCopyGrid(grid);

    // Flagパネルは全セルをFlagに変換
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        const targetCell = newGrid[rowIdx + i][colIdx + j];
        targetCell.type = 'Flag';
        targetCell.side = 'neutral';
      }
    }

    return [newGrid, undefined, undefined];
  }
}