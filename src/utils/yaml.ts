import { parse, stringify } from "yaml";

import { PanelCellTypeKey } from "@/types/panel";
import { GridCellKey } from "@/types/grid";
import { Panel } from "@/types/panel";
import { Grid, GridCell } from "@/types/grid";

import { capitalize, uncapitalize } from "./string-operations";

interface CellYamlData {
  Type: string;
  CellSide: string;
}

interface PanelYamlData {
  Type: string;
  Coordinates?: { X: number; Y: number }[];
}

const transformCellToYamlFormat = (cell: GridCell): CellYamlData => {
  return {
    Type: cell.type,
    CellSide: capitalize(cell.side),
  };
};

export const exportStageToYaml = (grid: Grid, panels: Panel[]) => {
  const cells = grid.map((row) =>
    row.map((cell) => transformCellToYamlFormat(cell))
  );

  const panelCoordinates = panels.map((panel) => {
    const baseData = {
      Type: panel.type || "Normal"
    };
    
    // Flagパネル以外の場合のみCoordinatesを追加
    if (panel.type !== "Flag") {
      return {
        ...baseData,
        Coordinates: panel.cells
          .flatMap((row, y) =>
            row
              .map((cell, x) => (cell === "Black" || cell === "Cut") ? { X: x, Y: y } : null)
              .filter((coord) => coord !== null)
          )
          .flat()
      };
    }
    
    return baseData;
  });

  const yamlStageData = {
    Height: grid.length,
    Width: grid[0].length,
    Cells: cells,
    Panels: panelCoordinates,
  };

  const yamlString = stringify(yamlStageData);
  const blob = new Blob([yamlString], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stage.yaml";
  link.click();
};

export const importStageFromYaml = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<[Grid, Panel[]] | null> => {
  const file = event.target.files?.[0];
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const yamlData = parse(e.target?.result as string);
        const { Height, Width, Cells, Panels } = yamlData;

        // グリッド変換
        const grid: Grid = Cells.map((row: CellYamlData[]) =>
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
            } else {
              // 通常のパネル処理
              const panelGrid: PanelCellTypeKey[][] = Array.from(
                { length: Height },
                () => Array.from({ length: Width }, () => "White")
              );
              panel.Coordinates?.forEach(({ X, Y }) => {
                // パネルタイプに応じてセルタイプを決定
                switch (panel.Type) {
                  case "Cut":
                    panelGrid[Y][X] = "Cut";
                    break;
                  default:
                    panelGrid[Y][X] = "Black";
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

        resolve([grid, trimmedPanels]);
      } catch (error) {
        console.error("Error importing YAML:", error);
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

// Panels全体をトリムする関数
const trimPanels = (panels: Panel[]): Panel[] => panels.map(trimPanelCells);

const trimPanelCells = (panel: Panel): Panel => {

  console.log("Trimming panel:", panel);

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
