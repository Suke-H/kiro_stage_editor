import { Grid } from '@/types/grid';
import { Panel, CopyPanel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid } from '../utils';

/**
 * Normalパネル用Strategy
 * Blackセルのfront/back反転処理
 */
export class NormalPanelStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): boolean {
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        if (panel.cells[i][j] === "Black") {
          const targetCell = grid[rowIdx + i][colIdx + j];
          // Normalパネルは Normal セルにのみ配置可能
          if (targetCell.type !== "Normal") {
            return false;
          }
        }
      }
    }
    return true;
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): [Grid, CopyPanel?] {
    const newGrid = deepCopyGrid(grid);
    
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        const cellType = panel.cells[i][j];
        if (cellType === "Black") {
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          // front<->back反転
          targetCell.side = targetCell.side === 'front' ? 'back' : 'front';
        } else if (cellType === "Flag") {
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          targetCell.type = 'Flag';
        } else if (cellType === "Cut") {
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          targetCell.type = 'Empty';
          targetCell.side = 'neutral';
        }
      }
    }
    
    return [newGrid]; // CopyPanelなし
  }
}