import { Grid, GridCell } from '@/types/grid';
import { Panel, CopyPanel } from '@/types/panel';
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

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, panel: Panel): [Grid, CopyPanel, undefined] {
    const newGrid = deepCopyGrid(grid);
    const copyCells: GridCell[][] = [];

    // コピー用のセル配列を初期化
    for (let i = 0; i < panel.cells.length; i++) {
      copyCells[i] = [];
      for (let j = 0; j < panel.cells[0].length; j++) {
        if (panel.cells[i][j] === "Black") {
          // 元のセルをコピーして保存
          copyCells[i][j] = { ...grid[rowIdx + i][colIdx + j] };
          // グリッドのセルを Empty に変換
          const targetCell = newGrid[rowIdx + i][colIdx + j];
          targetCell.type = 'Empty';
          targetCell.side = 'neutral';
        } else {
          copyCells[i][j] = { type: "Empty", side: "neutral" };
        }
      }
    }

    // CopyPanelを作成
    const copyPanel: CopyPanel = {
      id: `copy-${Date.now()}`,
      type: "Paste",
      cells: copyCells,
    };

    return [newGrid, copyPanel, undefined];
  }
}