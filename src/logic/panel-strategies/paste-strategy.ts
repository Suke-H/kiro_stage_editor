import { Grid } from '@/types/grid';
import { CopyPanel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid, getNeighbors } from '../utils';

/** 上下左右に空マス以外のマスがあるか */
const hasExistingNeighbor = (grid: Grid, row: number, col: number): boolean =>
  getNeighbors({ x: col, y: row }).some(({ x, y }) => {
    const neighbor = grid[y]?.[x];
    return neighbor !== undefined && neighbor.type !== "Empty";
  });

/**
 * Pasteパネル用Strategy
 * CopyPanelのセルを配置
 */
export class PastePanelStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, copyPanel: CopyPanel): boolean {
    let isAdjacentToExistingCell = false;

    for (let i = 0; i < copyPanel.cells.length; i++) {
      for (let j = 0; j < copyPanel.cells[0].length; j++) {
        const src = copyPanel.cells[i][j];
        if (src.type !== "Empty") {
          const row = rowIdx + i;
          const col = colIdx + j;
          // Pasteは Empty セルにのみ配置可能
          if (grid[row][col].type !== "Empty") {
            return false;
          }
          if (!isAdjacentToExistingCell) {
            isAdjacentToExistingCell = hasExistingNeighbor(grid, row, col);
          }
        }
      }
    }

    // 貼付パネルのセルが1つでも、上下左右に空マス以外のマスと隣り合っていること
    return isAdjacentToExistingCell;
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, copyPanel: CopyPanel): [Grid, undefined, undefined] {
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

    return [newGrid, undefined, undefined];
  }
}