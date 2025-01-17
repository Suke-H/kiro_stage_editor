import { CellType, Panel } from '@/components/types';
import { CELL_TYPES } from '../constants/cell-types';

const encodeStageToUrl = (grid: CellType[][], panels: Panel[]) => {
  // Cells のエンコード
  const cellsHeight = grid.length;
  const cellsWidth = grid[0].length;
  const cellsGrid = grid
    .flat()
    .map((cell) => CELL_TYPES[cell].code)
    .join('');
  const cellsEncoded = `h${cellsHeight}w${cellsWidth}g${cellsGrid}`;

  // Panels のエンコード
  const panelsEncoded = panels
    .map((panel) => {
      const height = panel.cells.length;
      const width = panel.cells[0].length;
      const gridData = panel.cells
        .flat()
        .map((cell) => CELL_TYPES[cell].code)
        .join('');
      return `h${height}w${width}g${gridData}`;
    })
    .join('_');

  return `cells=${cellsEncoded}&panels=${panelsEncoded}`;
};

export const shareStageUrl = (grid: CellType[][], panels: Panel[]) => {
  const stageData = encodeStageToUrl(grid, panels);
  const url = `${window.location.origin}/stage?${stageData}`;
  navigator.clipboard.writeText(url);
  alert('URLをコピーしました！');
};

export const decodeStageFromUrl = (stageData: string) => {
  const params = new URLSearchParams(stageData);

  // Cells のデコード
  const cellsRaw = params.get('cells') || '';
  const cellsHeightMatch = cellsRaw.match(/h(\d+)/);
  const cellsWidthMatch = cellsRaw.match(/w(\d+)/);
  const cellsGridMatch = cellsRaw.match(/g(.+)/);

  const cellsHeight = parseInt(cellsHeightMatch?.[1] || '0', 10);
  const cellsWidth = parseInt(cellsWidthMatch?.[1] || '0', 10);
  const cellsGridString = cellsGridMatch?.[1] || '';

  // グリッドデータをデコード（矢印の処理を改善）
  const decodeCellGrid = (gridString: string): CellType[] => {
    const cells: CellType[] = [];
    let i = 0;
    while (i < gridString.length) {
      const currentChar = gridString[i];
      
      // 'a'で始まる場合は矢印として処理
      if (currentChar === 'a' && i + 1 < gridString.length) {
        const direction = gridString[i + 1];
        let arrowType: CellType;
        
        switch (direction) {
          case 'u':
            arrowType = 'ArrowUp';
            break;
          case 'd':
            arrowType = 'ArrowDown';
            break;
          case 'l':
            arrowType = 'ArrowLeft';
            break;
          case 'r':
            arrowType = 'ArrowRight';
            break;
          default:
            // 不正な方向の場合はEmptyとして扱う
            arrowType = 'Empty';
        }
        
        cells.push(arrowType);
        i += 2; // 矢印は2文字分進める
      } else {
        // 通常のセル処理
        const cellType = Object.keys(CELL_TYPES).find(
          (key) => CELL_TYPES[key as CellType].code === currentChar
        ) as CellType || 'Empty';
        
        cells.push(cellType);
        i += 1; // 1文字分進める
      }
    }
    return cells;
  };

  // セルグリッドの作成
  const decodedCells = decodeCellGrid(cellsGridString);
  const cells = Array.from({ length: cellsHeight }, (_, i) =>
    decodedCells.slice(i * cellsWidth, (i + 1) * cellsWidth)
  );

  // Panels のデコード
  const panelsRaw = params.get('panels') || '';
  const panels = panelsRaw.split('_').map((panelStr, index) => {
    const heightMatch = panelStr.match(/h(\d+)/);
    const widthMatch = panelStr.match(/w(\d+)/);
    const gridMatch = panelStr.match(/g(.+)/);

    const height = parseInt(heightMatch?.[1] || '0', 10);
    const width = parseInt(widthMatch?.[1] || '0', 10);
    const gridData = gridMatch?.[1] || '';

    const decodedPanelCells = decodeCellGrid(gridData);
    const panelCells = Array.from({ length: height }, (_, i) =>
      decodedPanelCells.slice(i * width, (i + 1) * width)
    );

    return { id: `panel-${index}`, cells: panelCells };
  });

  return { cells, panels };
};
