import { Grid } from '@/types/grid';
import { CopyPanel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid } from '../utils';

/**
 * Pasteパネル用Strategy
 * CopyPanelのセルを配置
 */
export class PastePanelStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, copyPanel: CopyPanel): boolean {
    for (let i = 0; i < copyPanel.cells.length; i++) {
      for (let j = 0; j < copyPanel.cells[0].length; j++) {
        const src = copyPanel.cells[i][j];
        if (src.type !== "Empty") {
          const targetCell = grid[rowIdx + i][colIdx + j];
          // Pasteは Empty セルにのみ配置可能
          if (targetCell.type !== "Empty") {
            return false;
          }
        }
      }
    }
    return true;
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, copyPanel: CopyPanel): [Grid, CopyPanel?] {
    const newGrid = deepCopyGrid(grid);
    
    for (let i = 0; i < copyPanel.cells.length; i++) {
      for (let j = 0; j < copyPanel.cells[0].length; j++) {
        const src = copyPanel.cells[i][j];
        if (src.type !== "Empty") {
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          // コピーセルの内容をそのまま配置
          targetCell.type = src.type;
          targetCell.side = src.side;
        }
      }
    }
    
    return [newGrid]; // CopyPanelなし
  }
}