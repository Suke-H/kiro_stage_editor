import { PanelCellTypeKey, PANEL_CELL_TYPES } from "@/types/panel";
import { GridCellKey, GRID_CELL_TYPES, CellSideInfo } from "@/types/grid";
import { Panel } from "@/types/panel";
import { Grid, GridCell } from "@/types/grid";

const encodeStageToUrl = (grid: Grid, panels: Panel[]) => {
  // Cells のエンコード
  const cellsHeight = grid.length;
  const cellsWidth = grid[0].length;
  const cellsGrid = grid
    .flat()
    .map((cell) => {
      const cellDef = GRID_CELL_TYPES[cell.type]?.[cell.side];
      return cellDef ? cellDef.code : "";
    })
    .join("");
  const cellsEncoded = `h${cellsHeight}w${cellsWidth}g${cellsGrid}`;

  // Panels のエンコード
  const panelsEncoded = panels
    .map((panel) => {
      const height = panel.cells.length;
      const width = panel.cells[0].length;
      const gridData = panel.cells
        .flat()
        .map((cell) => PANEL_CELL_TYPES[cell].code)
        .join("");
      // タイプに応じたプレフィックスを追加
      let prefix = "";
      if (panel.type === "Cut") prefix = "c-";
      else if (panel.type === "Paste") prefix = "p-";
      else if (panel.type === "Flag") prefix = "f-";
      else if (panel.type === "Swap") prefix = "s-";
      else if (panel.type === "Invert") prefix = "i-";
      const panelStr = `h${height}w${width}g${gridData}`;
      return `${prefix}${panelStr}`;
    })
    .join("_");

  return `cells=${cellsEncoded}&panels=${panelsEncoded}&mode=play`;
};

export const shareStageUrl = (grid: Grid, panels: Panel[]) => {
  const stageData = encodeStageToUrl(grid, panels);
  const url = `${window.location.origin}/stage?${stageData}`;
  navigator.clipboard.writeText(url);
  alert("URLをコピーしました！");
};

export const decodeStageFromUrl = (stageData: string) => {
  const params = new URLSearchParams(stageData);

  // Cells のデコード
  const cellsRaw = params.get("cells") || "";
  const cellsHeightMatch = cellsRaw.match(/h(\d+)/);
  const cellsWidthMatch = cellsRaw.match(/w(\d+)/);
  const cellsGridMatch = cellsRaw.match(/g(.+)/);

  const cellsHeight = parseInt(cellsHeightMatch?.[1] || "0", 10);
  const cellsWidth = parseInt(cellsWidthMatch?.[1] || "0", 10);
  const cellsGridString = cellsGridMatch?.[1] || "";

  const GridCellKeys = Object.keys(GRID_CELL_TYPES) as GridCellKey[];

  // 型ガード
  const isCellSideInfo = (v: unknown): v is CellSideInfo =>
    typeof v === "object" && v !== null && "code" in v;

  const findCellByCode = (code: string): GridCell | null => {
    for (const type of GridCellKeys) {
      const def = GRID_CELL_TYPES[type];
      for (const sideKey of ["neutral", "front", "back"] as const) {
        const sideInfo = def[sideKey];
        if (isCellSideInfo(sideInfo) && sideInfo.code === code) {
          return { type, side: sideKey };
        }
      }
    }
    return null;
  };

  const decodeCellGrid = (gridString: string): GridCell[] => {
    const cells: GridCell[] = [];
    let i = 0;

    while (i < gridString.length) {
      const ch = gridString[i];

      if (/[A-Z]/.test(ch)) {
        // 大文字: 次がFかBなら2文字コードとして照合
        const next = gridString[i + 1];
        if (next === "F" || next === "B") {
          const found = findCellByCode(ch + next);
          if (found) {
            cells.push(found);
            i += 2;
            continue;
          }
        }
        // 次がF/Bでない、または2文字でマッチしなければ1文字照合
        const found = findCellByCode(ch);
        cells.push(found ?? { type: "Empty", side: "neutral" });
        i += 1;
      } else {
        // 小文字: 1文字照合
        const found1 = findCellByCode(ch);
        cells.push(found1 ?? { type: "Empty", side: "neutral" });
        i += 1;
      }
    }

    return cells;
  };

  const decodePanelGrid = (gridString: string): PanelCellTypeKey[] => {
    const cells: PanelCellTypeKey[] = [];
    let i = 0;
    while (i < gridString.length) {
      const currentChar = gridString[i];
      const cellType =
        (Object.keys(PANEL_CELL_TYPES).find(
          (key) =>
            PANEL_CELL_TYPES[key as PanelCellTypeKey].code === currentChar
        ) as PanelCellTypeKey) || "Empty";
      cells.push(cellType);
      i += 1;
    }
    return cells;
  };

  // セルグリッドの作成
  const decodedCells = decodeCellGrid(cellsGridString);
  const cells = Array.from({ length: cellsHeight }, (_, i) =>
    decodedCells.slice(i * cellsWidth, (i + 1) * cellsWidth)
  );

  // Panels のデコード
  const panelsRaw = params.get("panels") || "";
  const panels = panelsRaw.split("_").map((panelRaw, index) => {
    // プレフィックスからタイプ判定
    let panelStr = panelRaw;
    let type: Panel["type"] = "Normal"; // デフォルト値を設定
    if (panelStr.startsWith("c-")) {
      type = "Cut";
      panelStr = panelStr.slice(2);
    } else if (panelStr.startsWith("p-")) {
      type = "Paste";
      panelStr = panelStr.slice(2);
    } else if (panelStr.startsWith("f-")) {
      type = "Flag";
      panelStr = panelStr.slice(2);
    } else if (panelStr.startsWith("s-")) {
      type = "Swap";
      panelStr = panelStr.slice(2);
    } else if (panelStr.startsWith("i-")) {
      type = "Invert";
      panelStr = panelStr.slice(2);
    }

    const heightMatch = panelStr.match(/h(\d+)/);
    const widthMatch = panelStr.match(/w(\d+)/);
    const gridMatch = panelStr.match(/g(.+)/);

    const height = parseInt(heightMatch?.[1] || "0", 10);
    const width = parseInt(widthMatch?.[1] || "0", 10);
    const gridData = gridMatch?.[1] || "";

    const decodedPanelCells = decodePanelGrid(gridData);
    const panelCells = Array.from({ length: height }, (_, i) =>
      decodedPanelCells.slice(i * width, (i + 1) * width)
    );

    // Flagセルが含まれている場合はFlagタイプに設定
    if (decodedPanelCells.includes("Flag")) {
      type = "Flag";
    }
    // Swapセルが含まれている場合はSwapタイプに設定
    if (decodedPanelCells.includes("Swap")) {
      type = "Swap";
    }
    if (decodedPanelCells.includes("InvertCell")) {
      type = "Invert";
    }

    return { id: `panel-${index}`, cells: panelCells, type };
  });

  return { cells, panels };
};
