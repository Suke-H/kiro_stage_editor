import { Grid, GridCell } from '@/types/grid';
import { Panel } from '@/types/panel/schema';
import { PanelPlacement } from '@/types/panel-placement';
import { deepCopyGrid } from './utils';

/**
 * パネルタイプに応じた配置制約チェック
 */
const canPlaceOnCell = (panel: Panel, targetCell: GridCell): boolean => {
  const panelType = panel.type || 'Normal';
  
  switch (panelType) {
    case 'Normal':
      // 通常パネル：Normal(front)にのみ配置可能
      return targetCell.type === 'Normal';
    case 'Flag':
      // Flagパネル：Normal(front)にのみ配置可能
      return targetCell.type === 'Normal' && targetCell.side === 'front';
    case 'Cut':
      // Cutパネル：適切な配置制約を実装（仕様に応じて）
      return targetCell.type === 'Normal';
    case 'Paste':
      // Pasteパネル：適切な配置制約を実装（仕様に応じて）
      return targetCell.type === 'Normal';
    default:
      // デフォルト：Normal以外には配置不可
      return targetCell.type === 'Normal';
  }
};

/**
 * 単一パネル配置可能性判定
 * パネルの黒セルはパネルタイプに応じた制約に従って配置される
 */
const canPlaceSingle = (grid: Grid, placement: PanelPlacement): boolean => {
  const panel = placement.panel;
  const highlight = placement.highlight;
  const point = placement.point;
  
  const topLeftX = point.x - highlight.x;
  const topLeftY = point.y - highlight.y;
  
  const panelRows = panel.cells.length;
  const panelCols = panel.cells[0].length;
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  
  // 盤外チェック
  if (topLeftX < 0 || topLeftY < 0 ||
      topLeftX + panelCols > gridCols ||
      topLeftY + panelRows > gridRows) {
    return false;
  }
  
  // 黒セルの配置可能性チェック
  for (let dy = 0; dy < panelRows; dy++) {
    for (let dx = 0; dx < panelCols; dx++) {
      const cell = panel.cells[dy][dx];
      if (cell !== 'Black') {
        continue;
      }
      
      const targetX = topLeftX + dx;
      const targetY = topLeftY + dy;
      const targetCell = grid[targetY][targetX];
      
      // パネルタイプに応じた配置制約チェック
      if (!canPlaceOnCell(panel, targetCell)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * パネル配置実行
 * @param original 元のグリッド
 * @param placements 配置するパネルリスト
 * @param mutate trueなら元グリッドを変更、falseならコピーを返す
 * @returns [変更後グリッド, 全配置成功フラグ]
 */
export const placePanels = (
  original: Grid,
  placements: PanelPlacement[],
  mutate: boolean = false
): [Grid, boolean] => {
  const grid = mutate ? original : deepCopyGrid(original);
  
  for (const placement of placements) {
    // 配置可能性チェック
    if (!canPlaceSingle(grid, placement)) {
      return [grid, false];
    }
    
    const panel = placement.panel;
    const highlight = placement.highlight;
    const point = placement.point;
    
    const topLeftX = point.x - highlight.x;
    const topLeftY = point.y - highlight.y;
    
    // パネルの黒セルでfront/back状態を反転
    for (let dy = 0; dy < panel.cells.length; dy++) {
      for (let dx = 0; dx < panel.cells[0].length; dx++) {
        const cell = panel.cells[dy][dx];
        if (cell !== 'Black') {
          continue;
        }
        
        const targetX = topLeftX + dx;
        const targetY = topLeftY + dy;
        const targetCell = grid[targetY][targetX];
        
        // Neutralは無視、front<->backを反転
        if (targetCell.side === 'front') {
          targetCell.side = 'back';
        } else if (targetCell.side === 'back') {
          targetCell.side = 'front';
        }
      }
    }
  }
  
  // 全配置成功
  return [grid, true];
}