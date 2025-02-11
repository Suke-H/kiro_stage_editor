import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { gridSlice } from "../../store/slices/grid-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridCell, Panel, StudioMode } from "../types";
import { CELL_DEFINITIONS, CellSideInfo } from "../../constants/cell-types";

import { MatrixOperationPart } from "./grid/matrix-operation-part";
import { StageDataIOPart } from "./grid/stage-data-io-part";


export const Grid: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector((state: RootState) => state.studioMode.studioMode);
  const grid = useSelector((state: RootState) => state.grid.grid);
  const selectedCellType = useSelector((state: RootState) => state.cellType.selectedCellType);
  const panelPlacementMode = useSelector((state: RootState) => state.panelPlacement.panelPlacementMode);

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    // Editorモード
    if (studioMode === StudioMode.Editor) {
      const cellDef = CELL_DEFINITIONS[selectedCellType];

      // セル選択がFlipの場合：sideを反転
      if (selectedCellType === "Flip") {
        if (grid[rowIndex][colIndex].type !== "Empty") {
          dispatch(
            gridSlice.actions.flipCell({ row: rowIndex, col: colIndex })
          );
        }
      // 通常のセル選択（Flipでない）
      } else {
        // 基本はfront（表）で設置する。neutralのみの場合はneutral
        const side = "neutral" in cellDef ? "neutral" : "front";
        dispatch(
          gridSlice.actions.placeCell({
            row: rowIndex,
            col: colIndex,
            cell: { type: selectedCellType, side },
          })
        );
      }
    }

    // Playモード
    else{
      const placingPanel = panelPlacementMode.panel;

      // パネルが選択されていない場合は何もしない
      if (!placingPanel) {
        return;
      }

      // パネルを配置できるかチェック
      if (canPlacePanelAtLocation(grid, rowIndex, colIndex, placingPanel)) {

        // 事前に今のGridを履歴に保存
        dispatch(gridSlice.actions.saveHistory());

        const panelRows = placingPanel.cells.length;
        const panelCols = placingPanel.cells[0].length;

        for (let i = 0; i < panelRows; i++) {
          for (let j = 0; j < panelCols; j++) {
            if (placingPanel.cells[i][j] === "Black") {
              dispatch(
                gridSlice.actions.flipCell({
                  row: rowIndex + i,
                  col: colIndex + j,
                })
              );
            }
          }
        }

      }

      // （設置可/不可をとわず）終了後はパネル選択を解除
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
    }
  };

  const renderGridCell = (
    cell: GridCell,
    rowIndex: number,
    colIndex: number
  ) => {
    const cellDef = CELL_DEFINITIONS[cell.type];

    // セルの状態に応じた情報を取得
    const sideInfo: CellSideInfo | undefined = cellDef[cell.side];

    if (!sideInfo) {
      console.error(`No valid sideInfo found for cell type: ${cell.type}`);
      return null; // またはデフォルトの要素を返す
    }

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`h-10 w-10 flex items-center justify-center ${
          cell.type === "Empty" ? "" : "border"
        }`}
        onClick={() => handleGridCellClick(rowIndex, colIndex)}
      >
        {cell.type !== "Empty" && (
          <img
            src={`/cells/${sideInfo.picture}`}
            alt={`${cellDef.label} (${cell.side})`}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    );
  };

  const canPlacePanelAtLocation = (
    grid: GridCell[][],
    rowIndex: number,
    colIndex: number,
    panel: Panel
  ): boolean => {
    const panelRows = panel.cells.length;
    const panelCols = panel.cells[0].length;

    // グリッド範囲内に収まるか
    if (
      rowIndex + panelRows > grid.length ||
      colIndex + panelCols > grid[0].length
    ) {
      return false;
    }

    // パネルを配置するセルがすべて適切であるかチェック
    for (let i = 0; i < panelRows; i++) {
      for (let j = 0; j < panelCols; j++) {
        const panelCell = panel.cells[i][j];
        // パネルセルが黒の場合のみ設置判定
        if (panelCell === "Black") {
          const targetCell = grid[rowIndex + i][colIndex + j];

          // Emptyには置けない
          if (targetCell.type === "Empty") {
            return false;
          }

          // // neutralなセルには置けない（開始、ゴール、ダミーゴールなど）
          // const cellDef = CELL_DEFINITIONS[targetCell.type];
          // if ('neutral' in cellDef) {
          //   return false;
          // }
        }
      }
    }

    return true;
  };

  return (
    <Card className="w-fit bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>ステージグリッド</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-start">
          {/* ステージグリッド */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${grid[0].length}, 40px)`,
              gridTemplateRows: `repeat(${grid.length}, 40px)`,
              gap: "4px",
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cellType, colIndex) =>
                renderGridCell(cellType, rowIndex, colIndex)
              )
            )}
          </div>

          {/* 空白のdivを追加（右側の余白用） */}
          <div className="hidden lg:block w-20"></div>

          {/* パーツ配置エリア */}
          {studioMode === StudioMode.Editor && (
            <div className="flex flex-col gap-4 min-w-[200px] mt-8">
              <MatrixOperationPart />
              <StageDataIOPart />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
