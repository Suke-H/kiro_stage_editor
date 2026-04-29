import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { IPanelStrategy } from './types';
import { deepCopyGrid } from '../utils';

/**
 * 反転マスパネル用Strategy
 * 1マスの Normal(front) に置いて、そのマスを InvertCell に変える
 */
export class InvertPanelStrategy implements IPanelStrategy {
  canPlace(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel): boolean {
    const targetCell = grid[rowIdx][colIdx];
    return targetCell.type === 'Normal'; // 白黒両方に設置できる
  }

  applyEffect(grid: Grid, rowIdx: number, colIdx: number, _panel: Panel): [Grid, undefined, undefined] {
    const newGrid = deepCopyGrid(grid);
    const targetCell = newGrid[rowIdx][colIdx];
    targetCell.type = 'InvertCell';

    return [newGrid, undefined, undefined];
  }
}
