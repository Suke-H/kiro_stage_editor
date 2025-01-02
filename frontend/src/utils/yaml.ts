import { CellType, Panel } from '@/components/types';
import { parse, stringify } from 'yaml';


interface CellYamlData {
    Type: {
      Type: string; // "N", "S", "G", "D", "C", "O" など
      SkinId: number;
    };
    StartColor: string; // "Black", "White", "Empty"
  }
  
  interface PanelYamlData {
    Coordinates: { x: number; y: number }[];
  }
  
  interface StageRawData {
    Id: number; // ステージID (1で固定)
    Height: number; // グリッドの高さ
    Width: number; // グリッドの幅
    Cells: CellYamlData[][]; // グリッドのセルデータ
    Panels: PanelYamlData[]; // パネルデータ
  }
  
  interface YamlStageData {
    StageRawData: StageRawData;
  }

const transformCellToYamlFormat = (cell: CellType) : CellYamlData => {
  if (cell === 'black' || cell === 'white') {
    return { Type: { Type: 'N', SkinId: 0 }, StartColor: cell.charAt(0).toUpperCase() + cell.slice(1) };
  }
  if (cell === 'empty') {
    return { Type: { Type: 'N', SkinId: 0 }, StartColor: 'Empty' };
  }
  const typeMap: Record<CellType, string> = {
    'empty': 'N',
    'white': 'N',
    'black': 'N',
    'start': 'S',
    'goal': 'G',
    'dummy-goal': 'D',
    'crow': 'C',
    'obstacle': 'O',
  };
  return { Type: { Type: typeMap[cell], SkinId: 0 }, StartColor: 'White' };
};

export const exportStageToYaml = (
  grid: CellType[][],
  panels: Panel[]
) => {
  const cells = grid.map(row => row.map(cell => transformCellToYamlFormat(cell)));

  const panelCoordinates = panels.map(panel => ({
    Coordinates: panel.cells.flatMap((row, y) =>
      row.map((cell, x) => cell === 'black' ? { x, y } : null).filter(coord => coord !== null)
    ).flat(),
  }));

  const stageData = {
    StageRawData: {
      Id: 1,
      Height: grid.length,
      Width: grid[0].length,
      Cells: cells,
      Panels: panelCoordinates,
    },
  };

  const yamlString = stringify(stageData);
  const blob = new Blob([yamlString], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stage.yaml';
  link.click();
};

export const importStageFromYaml = (
  event: React.ChangeEvent<HTMLInputElement>,
  setGrid: (grid: CellType[][]) => void,
  setPanels: (panels: Panel[]) => void
) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const yamlData: YamlStageData = parse(e.target?.result as string);
      const { Height, Width, Cells, Panels } = yamlData.StageRawData;

      // グリッド変換
      const grid: CellType[][] = Cells.map((row) =>
        row.map((cell) => {
          if (cell.Type.Type === 'N') {
            return cell.StartColor.toLowerCase() as CellType; // "black", "white", "empty"
          }
          const typeMap: Record<string, CellType> = {
            S: 'start',
            G: 'goal',
            D: 'dummy-goal',
            C: 'crow',
            O: 'obstacle',
          };
          return typeMap[cell.Type.Type];
        })
      );

      // パネル変換
      const panels: Panel[] = Panels.map((panel, index) => {
        const panelGrid: CellType[][] = Array.from({ length: Height }, () =>
          Array.from({ length: Width }, () => 'empty')
        );
        panel.Coordinates.forEach(({ x, y }) => {
          panelGrid[y][x] = 'black'; // "black"セルのみパネルに反映
        });
        return {
          id: `panel-${index}`,
          cells: panelGrid,
        };
      });

      setGrid(grid);
      setPanels(panels);
    };
    reader.readAsText(file);
  }
};

  
