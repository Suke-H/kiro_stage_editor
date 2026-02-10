import { Grid } from '@/types/grid';
import { Panel, CopyPanel } from '@/types/panel/schema';
import { PanelPlacement } from '@/types/panel-placement';
import { deepCopyGrid } from './utils';
import { getStrategy } from './panel-strategies';

/**
 * 単一パネル配置可能性判定（PanelPlacement形式）
 * パネルの黒セルはパネルタイプに応じた制約に従って配置される
 */
export const canPlaceSinglePanel = (grid: Grid, placement: PanelPlacement): boolean => {
  const panel = placement.panel;
  const highlight = placement.highlight;
  const point = placement.point;
  
  const topLeftX = point.x - highlight.x;
  const topLeftY = point.y - highlight.y;
  
  return canPlacePanelAt(grid, topLeftY, topLeftX, panel);
};

/**
 * パネル配置可能性判定（座標直接指定）
 * grid-viewerとの互換性のため
 */
export const canPlacePanelAt = (
  grid: Grid,
  rowIdx: number,
  colIdx: number,
  panel: Panel | CopyPanel
): boolean => {
  const panelRows = panel.cells.length;
  const panelCols = panel.cells[0].length;
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  
  // 盤外チェック
  if (rowIdx < 0 || colIdx < 0 ||
      colIdx + panelCols > gridCols ||
      rowIdx + panelRows > gridRows) {
    return false;
  }
  
  // Strategyパターンを使用してパネルタイプ別チェック
  const strategy = getStrategy(panel.type);
  return strategy.canPlace(grid, rowIdx, colIdx, panel);
};

/**
 * 単一パネルの配置処理を実行（PanelPlacement形式）
 */
const applyPanelPlacement = (grid: Grid, placement: PanelPlacement): [Grid, CopyPanel?, { swapAction?: string; pos?: { row: number; col: number } }?] => {
  const { panel, highlight, point } = placement;
  const topLeftX = point.x - highlight.x;
  const topLeftY = point.y - highlight.y;

  return applyPanelAt(grid, topLeftY, topLeftX, panel);
};

/**
 * パネル効果適用（座標直接指定）
 * grid-viewerとの互換性のため
 */
export const applyPanelAt = (
  grid: Grid,
  rowIdx: number,
  colIdx: number,
  panel: Panel | CopyPanel
): [Grid, CopyPanel?, { swapAction?: string; pos?: { row: number; col: number } }?] => {
  // Strategyパターンを使用してパネルタイプ別適用
  const strategy = getStrategy(panel.type);
  return strategy.applyEffect(grid, rowIdx, colIdx, panel);
};

/**
 * パネル配置実行（既存のsolverなど向け）
 * @param original 元のグリッド
 * @param placements 配置するパネルリスト
 * @param mutate trueなら元グリッドを変更、falseならコピーを返す
 * @returns [変更後グリッド, 全配置成功フラグ] または [変更後グリッド, 全配置成功フラグ, {copyPanel}]
 */
export const placePanels = (
  original: Grid,
  placements: PanelPlacement[],
  mutate: boolean = false
): [Grid, boolean] | [Grid, boolean, { copyPanel: CopyPanel }] => {
  const grid = mutate ? original : deepCopyGrid(original);
  
  // 事前チェック：全配置が可能か確認
  for (const placement of placements) {
    if (!canPlaceSinglePanel(grid, placement)) {
      return [grid, false];
    }
  }
  
  // 配置実行
  let currentGrid = grid;
  let lastCopyPanel: CopyPanel | undefined;
  
  for (const placement of placements) {
    const [newGrid, copyPanel] = applyPanelPlacement(currentGrid, placement);
    currentGrid = newGrid;
    if (copyPanel) {
      lastCopyPanel = copyPanel;
    }
  }
  
  // CopyPanelが生成された場合は3要素、そうでなければ2要素を返す
  if (lastCopyPanel) {
    return [currentGrid, true, { copyPanel: lastCopyPanel }];
  } else {
    return [currentGrid, true];
  }
};

/**
 * パネル配置実行（CopyPanel生成対応版、grid-viewer向け）
 * @param original 元のグリッド
 * @param placements 配置するパネルリスト
 * @param mutate trueなら元グリッドを変更、falseならコピーを返す
 * @returns [変更後グリッド, 全配置成功フラグ, 作成されたCopyPanelリスト]
 */
export const placePanelsWithCopy = (
  original: Grid,
  placements: PanelPlacement[],
  mutate: boolean = false
): [Grid, boolean, CopyPanel[]] => {
  const grid = mutate ? original : deepCopyGrid(original);
  
  // 事前チェック：全配置が可能か確認
  for (const placement of placements) {
    if (!canPlaceSinglePanel(grid, placement)) {
      return [grid, false, []];
    }
  }
  
  // 配置実行
  let currentGrid = grid;
  const createdCopyPanels: CopyPanel[] = [];
  
  for (const placement of placements) {
    const [newGrid, copyPanel] = applyPanelPlacement(currentGrid, placement);
    currentGrid = newGrid;
    if (copyPanel) {
      createdCopyPanels.push(copyPanel);
    }
  }
  
  return [currentGrid, true, createdCopyPanels];
};