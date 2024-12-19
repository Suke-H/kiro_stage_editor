import { CellType, Panel } from '@/components/types';
import { CELL_TYPES } from '../constants/cell-types';

const encodeStageToUrl = (grid: CellType[][], panels: Panel[]) => {
  // Cellsのデータをエンコード
  const cellsHeight = grid.length;
  const cellsWidth = grid[0].length;
  const cellsGrid = grid
    .flat()
    .map((cell) => CELL_TYPES[cell]?.code || '') // CellTypeからcodeに変換
    .join('');
  const cellsEncoded = `h${cellsHeight}w${cellsWidth}g${cellsGrid}`;

  // Panelsのデータをエンコード
  const panelsEncoded = panels
    .map((panel) => {
      const height = panel.cells.length;
      const width = panel.cells[0].length;
      const gridData = panel.cells
        .flat()
        .map((cell) => CELL_TYPES[cell]?.code || '') // CellTypeからcodeに変換
        .join('');
      return `h${height}w${width}g${gridData}`;
    })
    .join('_'); // パネルはアンダースコアで区切る

  // URL形式にまとめる
  return `cells=${cellsEncoded}&panels=${panelsEncoded}`;
};

export const shareStageUrl = (grid: CellType[][], panels: Panel[]) => {
  const stageData = encodeStageToUrl(grid, panels);
  const url = `${window.location.origin}/stage?${stageData}`;
  navigator.clipboard.writeText(url);
  alert('URLをコピーしました！');
};

export const decodeStageFromUrl = (stageData: string) => {
  console.log(stageData);
  const params = new URLSearchParams(stageData);

  // Cellsのデータをデコード
  const cellsRaw = params.get('cells') || '';
  const cellsHeightMatch = cellsRaw.match(/h(\d+)/);
  const cellsWidthMatch = cellsRaw.match(/w(\d+)/);
  const cellsGridMatch = cellsRaw.match(/g([a-z0-9]+)/);

  const cellsHeight = parseInt(cellsHeightMatch?.[1] || '0', 10);
  const cellsWidth = parseInt(cellsWidthMatch?.[1] || '0', 10);
  const cellsGrid = cellsGridMatch?.[1] || '';
  const cells = Array.from({ length: cellsHeight }, (_, i) =>
    cellsGrid
      .slice(i * cellsWidth, (i + 1) * cellsWidth)
      .split('')
      .map((code) => Object.keys(CELL_TYPES).find((key) => CELL_TYPES[key as CellType].code === code) as CellType), // codeをCellTypeに変換
  );

  // Panelsのデータをデコード
  const panelsRaw = params.get('panels') || '';
  const panels = panelsRaw.split('_').map((panelStr, index) => {
    const heightMatch = panelStr.match(/h(\d+)/);
    const widthMatch = panelStr.match(/w(\d+)/);
    const gridMatch = panelStr.match(/g([a-z0-9]+)/);

    const height = parseInt(heightMatch?.[1] || '0', 10);
    const width = parseInt(widthMatch?.[1] || '0', 10);
    const gridData = gridMatch?.[1] || '';

    const cells = Array.from({ length: height }, (_, i) =>
      gridData
        .slice(i * width, (i + 1) * width)
        .split('')
        .map((code) => Object.keys(CELL_TYPES).find((key) => CELL_TYPES[key as CellType].code === code) as CellType), // codeをCellTypeに変換
    );

    return { id: `panel-${index}`, cells };
  });

  return { cells, panels };
};
