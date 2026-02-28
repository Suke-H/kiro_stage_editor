import { parse, stringify } from "yaml";

import { Grid, GridCell } from "@/types/grid";
import { Panel, PanelCellTypeKey } from "@/types/panel";
import { GridCellKey } from "@/types/grid";
import { capitalize, uncapitalize } from "./string-operations";

const STORAGE_KEY = "kiro-stage-data";

interface CellYamlData {
  Type: string;
  CellSide: string;
}

interface PanelYamlData {
  Type: string;
  Coordinates?: { X: number; Y: number }[];
}

interface StageYamlData {
  Height: number;
  Width: number;
  Cells: CellYamlData[][];
  Panels: PanelYamlData[];
}

const transformCellToYamlFormat = (cell: GridCell): CellYamlData => {
  return {
    Type: cell.type,
    CellSide: capitalize(cell.side),
  };
};

// Empty削除関数：外側の余分なEmptyセルを削除
const removeExtraEmptyCells = (grid: Grid): Grid => {
  if (grid.length === 0 || grid[0].length === 0) return grid;

  let minRow = 0;
  let maxRow = grid.length - 1;
  let minCol = 0;
  let maxCol = grid[0].length - 1;

  // 上から削除可能な行を見つける
  while (minRow <= maxRow && grid[minRow].every(cell => cell.type === "Empty")) {
    minRow++;
  }

  // 下から削除可能な行を見つける
  while (maxRow >= minRow && grid[maxRow].every(cell => cell.type === "Empty")) {
    maxRow--;
  }

  // 左から削除可能な列を見つける
  while (minCol <= maxCol && grid.slice(minRow, maxRow + 1).every(row => row[minCol].type === "Empty")) {
    minCol++;
  }

  // 右から削除可能な列を見つける
  while (maxCol >= minCol && grid.slice(minRow, maxRow + 1).every(row => row[maxCol].type === "Empty")) {
    maxCol--;
  }

  // すべてがEmptyの場合は1x1のEmptyグリッドを返す
  if (minRow > maxRow || minCol > maxCol) {
    return [[{ type: "Empty", side: "neutral" }]];
  }

  // トリムされたグリッドを作成
  return grid.slice(minRow, maxRow + 1).map(row => row.slice(minCol, maxCol + 1));
};

// Panels全体をトリムする関数
const trimPanels = (panels: Panel[]): Panel[] => panels.map(trimPanelCells);

const trimPanelCells = (panel: Panel): Panel => {
  // 特殊パネル（Flag、Swap）は既に1x1で作成されているのでトリム不要
  if (panel.type === "Flag" || panel.type === "Swap") {
    return panel;
  }

  // "Black"セルの座標を取得
  const coordinates = panel.cells.flatMap((row, rowIndex) =>
    row
      .map((cell, colIndex) =>
        cell === "Black" ? { X: colIndex, Y: rowIndex } : null
      )
      .filter((coord) => coord !== null)
  );

  if (coordinates.length === 0) {
    // セルがない場合、空のパネルとして返す
    return { id: panel.id, cells: [], type: panel.type || "Normal" };
  }

  // x, yの最小値と最大値を計算
  const minX = Math.min(...coordinates.map((coord) => coord!.X));
  const maxX = Math.max(...coordinates.map((coord) => coord!.X));
  const minY = Math.min(...coordinates.map((coord) => coord!.Y));
  const maxY = Math.max(...coordinates.map((coord) => coord!.Y));

  // トリムされたセルを作成
  const trimmedCells = panel.cells
    .slice(minY, maxY + 1)
    .map((row) => row.slice(minX, maxX + 1));

  return {
    id: panel.id,
    cells: trimmedCells,
    type: panel.type || "Normal",
  };
};

/**
 * gridとpanelsをlocalStorageに保存
 */
export const saveStageToLocalStorage = (grid: Grid, panels: Panel[]): void => {
  try {
    const trimmedGrid = removeExtraEmptyCells(grid);

    // Y軸を反転してYAMLに出力（上下逆さま）
    const cells = [...trimmedGrid].reverse().map((row) =>
      row.map((cell) => transformCellToYamlFormat(cell))
    );

    const panelCoordinates = panels.map((panel) => {
      const baseData = {
        Type: panel.type || "Normal"
      };

      // 特殊パネル（Flag, Swap）の場合は固定座標（X: 0, Y: 0）を追加
      if (panel.type === "Flag" || panel.type === "Swap") {
        return {
          ...baseData,
          Coordinates: [{ X: 0, Y: 0 }]
        };
      }

      // 特殊パネル以外は通常の座標処理
      return {
        ...baseData,
        Coordinates: panel.cells
          .flatMap((row, y) =>
            row
              .map((cell, x) => (cell === "Black" || cell === "Cut") ? { X: x, Y: panel.cells.length - 1 - y } : null)
              .filter((coord) => coord !== null)
          )
          .flat()
      };
    });

    const yamlStageData: StageYamlData = {
      Height: trimmedGrid.length,
      Width: trimmedGrid[0].length,
      Cells: cells,
      Panels: panelCoordinates,
    };

    const yamlString = stringify(yamlStageData);
    localStorage.setItem(STORAGE_KEY, yamlString);

    console.log("Stage saved to localStorage");
  } catch (error) {
    console.error("Failed to save stage to localStorage:", error);
    throw error;
  }
};

/**
 * localStorageからデータをロード
 */
export const loadStageFromLocalStorage = (): [Grid, Panel[]] | null => {
  try {
    const yamlString = localStorage.getItem(STORAGE_KEY);
    if (!yamlString) return null;

    const yamlData = parse(yamlString) as StageYamlData;
    const { Height, Width, Cells, Panels } = yamlData;

    // グリッド変換（Y軸を反転して読み込み）
    const grid: Grid = [...Cells].reverse().map((row: CellYamlData[]) =>
      row.map((cell: CellYamlData) => ({
        type: cell.Type as GridCellKey,
        side: uncapitalize(cell.CellSide) as GridCell["side"],
      }))
    );

    // パネル変換とトリム
    const panels: Panel[] = Panels.map(
      (panel: PanelYamlData, index: number) => {
        if (panel.Type === "Flag") {
          // Flagパネルの場合は1x1のFlagセルを作成
          return {
            id: `panel-${index}`,
            cells: [["Flag"]],
            type: "Flag",
          };
        } else if (panel.Type === "Swap") {
          // Swapパネルの場合は1x1のSwapセルを作成
          return {
            id: `panel-${index}`,
            cells: [["Swap"]],
            type: "Swap",
          };
        } else {
          // 通常のパネル処理
          const panelGrid: PanelCellTypeKey[][] = Array.from(
            { length: Height },
            () => Array.from({ length: Width }, () => "White")
          );
          panel.Coordinates?.forEach(({ X, Y }) => {
            // パネルタイプに応じてセルタイプを決定
            const reversedY = Height - 1 - Y;
            switch (panel.Type) {
              case "Cut":
                panelGrid[reversedY][X] = "Cut";
                break;
              default:
                panelGrid[reversedY][X] = "Black";
            }
          });
          return {
            id: `panel-${index}`,
            cells: panelGrid,
            type: (panel.Type as Panel["type"]) || "Normal",
          };
        }
      }
    );

    // パネルのトリム処理
    const trimmedPanels = trimPanels(panels);

    console.log("Stage loaded from localStorage");
    return [grid, trimmedPanels];
  } catch (error) {
    console.error("Failed to load stage from localStorage:", error);
    return null;
  }
};

/**
 * localStorage のデータをクリア
 */
export const clearLocalStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log("localStorage cleared");
};
