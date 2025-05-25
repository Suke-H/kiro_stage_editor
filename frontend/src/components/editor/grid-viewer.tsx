import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { gridSlice } from "../../store/slices/grid-slice";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridCell, Grid } from "@/types/grid";
import { Panel } from "@/types/panel";
import { StudioMode } from "@/types/store";
import { GRID_CELL_TYPES, GridCellKey, CellSideInfo } from "@/types/grid";

import { MatrixOperationPart } from "./grid/matrix-operation-part";
import { StageDataIOPart } from "./grid/stage-data-io-part";

export const GridViewer: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector(
    (state: RootState) => state.studioMode.studioMode
  );
  const grid: Grid = useSelector((state: RootState) => state.grid.grid);
  const selectedCellType = useSelector(
    (state: RootState) => state.cellType.selectedCellType
  ) as GridCellKey;
  const panelPlacementMode = useSelector(
    (state: RootState) => state.panelPlacement.panelPlacementMode
  );

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    const placingPanel = panelPlacementMode.panel;

    // セル配置モード
    // （エディタモード、かつ配置パネル未選択）
    if (studioMode === StudioMode.Editor && placingPanel === null) {
      const cellDef = GRID_CELL_TYPES[selectedCellType];

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

    // パネル配置モード
    // （エディタモードでも実施可）
    else {
      // 配置するパネルが選択されていない場合は何もしない
      if (!placingPanel) return;

      // パネルを配置できるかチェック
      if (canPlacePanelAtLocation(grid, rowIndex, colIndex, placingPanel)) {
        // パネルを配置(リストから削除)
        dispatch(panelListSlice.actions.placePanel(placingPanel));

        // 事前に今のGridを履歴に保存
        dispatch(gridSlice.actions.saveHistory());

        const panelRows = placingPanel.cells.length;
        const panelCols = placingPanel.cells[0].length;

        for (let i = 0; i < panelRows; i++) {
          for (let j = 0; j < panelCols; j++) {

            // パネルがFlagなら、GridにもFlagを設置
            if (placingPanel.cells[i][j] === "Flag") {
              dispatch(
                gridSlice.actions.placeCell({
                  row: rowIndex + i,
                  col: colIndex + j,
                  cell: { type: "Flag", side: "neutral" },
                })
              );
            }

          
            // パネルがCutなら、GridをEmptyにする
            else if (placingPanel.cells[i][j] === "Cut") {
              console.log(
                `Cut panel placed at (${rowIndex + i}, ${colIndex + j})`
              );
              dispatch(
                gridSlice.actions.placeCell({
                  row: rowIndex + i,
                  col: colIndex + j,
                  cell: { type: "Empty", side: "neutral" },
                })
              );
            }

            // パネルセルが存在する（=Black）場合、反転
            else if (placingPanel.cells[i][j] === "Black") {
              console.log(
                `Black panel placed at (${rowIndex + i}, ${colIndex + j})`
              );

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
    const cellDef = GRID_CELL_TYPES[cell.type];

    // セルの状態に応じた情報を取得
    const sideInfo: CellSideInfo | undefined = cellDef[cell.side];

    if (!sideInfo) {
      console.error(`No valid sideInfo found for cell type: ${cell.type}`);
      return null; // またはデフォルトの要素を返す
    }

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`relative h-10 w-10 flex items-center justify-center ${
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
    grid: Grid,
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
          // const cellDef = GRID_CELL_TYPES[targetCell.type];
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
              gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, 40px)`,
              gridTemplateRows: `repeat(${grid.length}, 40px)`,
              gap: "4px",
            }}
          >
            {grid.map((row: GridCell[], rowIndex: number) =>
              row.map((cellType: GridCell, colIndex: number) =>
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
