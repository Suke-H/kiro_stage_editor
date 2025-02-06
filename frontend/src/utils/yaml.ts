import { parse, stringify } from 'yaml';
import { CellDefinitions, CellType, Panel, GridCell } from '@/components/types';
// import { CELL_DEFINITIONS, CELL_TYPES } from '../constants/cell-types';
import { capitalize, uncapitalize } from './string-operations';

import { panelSlice } from '../store/slices/panel-slice';
import { UnknownAction } from '@reduxjs/toolkit';
import { Dispatch as DisPatch } from 'redux';

interface CellYamlData {
  Type: {
    Type: string;
    SkinId: number;
  };
  CellSide: string;
}

interface PanelYamlData {
  Coordinates: { X: number; Y: number }[];
}

const transformCellToYamlFormat = (cell: GridCell): CellYamlData => {
  return { 
    Type: { 
      Type: cell.type, 
      SkinId: 0 
    }, 
    CellSide: capitalize(cell.side)
  };
};

export const exportStageToYaml = (
  grid: GridCell[][],
  panels: Panel[]
) => {
  const cells = grid.map(row => row.map(cell => transformCellToYamlFormat(cell)));

  const panelCoordinates = panels.map(panel => ({
    Coordinates: panel.cells.flatMap((row, y) =>
      row.map((cell, x) => cell === 'Black' ? { X: x, Y: y } : null).filter(coord => coord !== null)
    ).flat(),
  }));

  const yamlStageData = {
    Id: 1,
    Height: grid.length,
    Width: grid[0].length,
    Cells: cells,
    Panels: panelCoordinates,
  };

  const yamlString = stringify(yamlStageData);
  const blob = new Blob([yamlString], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stage.yaml';
  link.click();
};

export const importStageFromYaml = (
  event: React.ChangeEvent<HTMLInputElement>,
  setGrid: (grid: GridCell[][]) => void,
  // setPanels: (panels: Panel[]) => void
  dispatch: DisPatch<UnknownAction>
) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const yamlData = parse(e.target?.result as string);
        const { Height, Width, Cells, Panels } = yamlData;

        // グリッド変換
        const grid: GridCell[][] = Cells.map((row: CellYamlData[]) =>
          row.map((cell: CellYamlData) => ({
            type: cell.Type.Type as CellDefinitions,
            side: uncapitalize(cell.CellSide) as GridCell['side']
          }))
        );

        // パネル変換とトリム
        const panels: Panel[] = Panels.map((panel: PanelYamlData, index: number) => {
          const panelGrid: CellType[][] = Array.from({ length: Height }, () =>
            Array.from({ length: Width }, () => 'Empty')
          );
          panel.Coordinates.forEach(({ X, Y }) => {
            panelGrid[Y][X] = 'Black';
          });
          return {
            id: `panel-${index}`,
            cells: panelGrid,
          };
        });

        // パネルのトリム処理
        const trimmedPanels = trimPanels(panels);

        setGrid(grid);
        // setPanels(trimmedPanels);
        dispatch(panelSlice.actions.loadPanels(trimmedPanels));
        
      } catch (error) {
        console.error('Error importing YAML:', error);
      }
    };
    reader.readAsText(file);
  }
};

// Panels全体をトリムする関数
const trimPanels = (panels: Panel[]): Panel[] => panels.map(trimPanelCells);

const trimPanelCells = (panel: Panel): Panel => {
  // "Black"セルの座標を取得
  const coordinates = panel.cells.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => (cell === 'Black' ? { X: colIndex, Y: rowIndex } : null))
      .filter(coord => coord !== null)
  );

  if (coordinates.length === 0) {
    // セルがない場合、空のパネルとして返す
    return { id: panel.id, cells: [] };
  }

  // x, yの最小値と最大値を計算
  const minX = Math.min(...coordinates.map(coord => coord!.X));
  const maxX = Math.max(...coordinates.map(coord => coord!.X));
  const minY = Math.min(...coordinates.map(coord => coord!.Y));
  const maxY = Math.max(...coordinates.map(coord => coord!.Y));

  // トリムされたセルを作成
  const trimmedCells = panel.cells.slice(minY, maxY + 1)
    .map(row => row.slice(minX, maxX + 1));

  return {
    id: panel.id,
    cells: trimmedCells,
  };
};
