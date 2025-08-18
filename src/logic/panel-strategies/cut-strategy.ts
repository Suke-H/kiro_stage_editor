import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid } from '../utils';

/**
 * Cutパネル用Strategy
 * Blackセル位置を空セルに変換
 */
export class CutPanelStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): boolean {
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        if (panel.cells[i][j] === "Black") {
          const targetCell = grid[rowIdx + i][colIdx + j];
          // Cutは Normal セルにのみ適用可能
          if (targetCell.type !== "Normal") {
            return false;
          }
        }
      }
    }
    return true;
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): Grid {
    const newGrid = deepCopyGrid(grid);
    
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        if (panel.cells[i][j] === "Black") {
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          // Cutされたセルは Empty に変換
          targetCell.type = 'Empty';
          targetCell.side = 'neutral';
        }
      }
    }
    
    return newGrid;
  }
}