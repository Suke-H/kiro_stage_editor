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

    // セル配置モード（エディタモード & パネル未選択）
    if (studioMode === StudioMode.Editor && !placingPanel) {
      const cellDef = GRID_CELL_TYPES[selectedCellType];
      if (selectedCellType === "Flip") {
        if (grid[rowIndex][colIndex].type !== "Empty") {
          dispatch(
            gridSlice.actions.flipCell({ row: rowIndex, col: colIndex })
          );
        }
      } else {
        const side = "neutral" in cellDef ? "neutral" : "front";
        dispatch(
          gridSlice.actions.placeCell({
            row: rowIndex,
            col: colIndex,
            cell: { type: selectedCellType, side },
          })
        );
      }
      return;
    }

    // パネル配置モード
    if (!placingPanel) return;
    const panelType = placingPanel.type ?? "Normal";

    // 配置可否チェック
    if (!canPlacePanelAtLocation(grid, rowIndex, colIndex, placingPanel)) {
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
      return;
    }

    // 履歴保存
    dispatch(gridSlice.actions.saveHistory());

    // Cut用コピー先初期化
    let newCutPanelCells: GridCellKey[][] = [];
    if (panelType === "Cut") {
      newCutPanelCells = placingPanel.cells.map(row =>
        row.map(() => "Empty")
      );
    }

    // 各セルごとに分岐配置
    placingPanel.cells.forEach((row, i) => {
      row.forEach((cellType, j) => {
        const r = rowIndex + i;
        const c = colIndex + j;
        const target = grid[r][c];

        if (panelType === "Normal") {
          // 元の挙動：Black なら flip
          if (cellType === "Black") {
            dispatch(gridSlice.actions.flipCell({ row: r, col: c }));
          }
          // 元の挙動：Flag セルなら Flag、Cut セルなら Empty
          else if (cellType === "Flag") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Flag", side: "neutral" },
              })
            );
          } else if (cellType === "Cut") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Empty", side: "neutral" },
              })
            );
          }
        }
        else if (panelType === "Flag") {
          // Flag パネル：セルが Empty でなければすべて Flag
          // if (cellType !== "Empty") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Flag", side: "neutral" },
              })
            );
          // }
        }
        else if (panelType === "Cut") {
          // Cut パネル：Black なら Empty にしつつコピー
          if (cellType === "Black") {
            newCutPanelCells[i][j] = target.type;
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Empty", side: "neutral" },
              })
            );
          }
        }
        else if (panelType === "Paste") {
          // Paste パネル：Empty 以外なら上書き
          const casted = cellType as unknown as GridCellKey;
          if (casted !== "Empty") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: casted, side: "front" },
              })
            );
          }
        }
      });
    });

    // パネルをリストから削除
    dispatch(panelListSlice.actions.placePanel(placingPanel));

    // Cutでコピーしたパネルを追加
    if (panelType === "Cut") {
      dispatch(
        panelListSlice.actions.createPanel({
          id: `cut-${Date.now()}`,
          type: "Paste",
          cells: newCutPanelCells,
        } as Panel)
      );
    }

    // 選択解除
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
  };

  const canPlacePanelAtLocation = (
    grid: Grid,
    rowIndex: number,
    colIndex: number,
    panel: Panel
  ): boolean => {
    const rows = panel.cells.length;
    const cols = panel.cells[0].length;

    // 範囲外チェック
    if (
      rowIndex + rows > grid.length ||
      colIndex + cols > grid[0].length
    ) {
      return false;
    }

    if (panel.type === "Paste") {
      // Paste：すべてEmptyであること
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const key = panel.cells[i][j] as unknown as GridCellKey;
          if (key !== "Empty" && grid[rowIndex + i][colIndex + j].type !== "Empty") {
            return false;
          }
        }
      }
      return true;
    }

    // それ以外（Normal/Flag/Cut）は元の Blackのみ判定
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (panel.cells[i][j] === "Black" && grid[rowIndex + i][colIndex + j].type === "Empty") {
          return false;
        }
      }
    }
    return true;
  };

  const renderGridCell = (
    cell: GridCell,
    rowIndex: number,
    colIndex: number
  ) => {
    const cellDef = GRID_CELL_TYPES[cell.type];
    const sideInfo: CellSideInfo | undefined = cellDef[cell.side];
    if (!sideInfo) {
      console.error(`No valid sideInfo for ${cell.type}`);
      return null;
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

  return (
    <Card className="w-fit bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>ステージグリッド</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-start">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, 40px)`,
              gridTemplateRows: `repeat(${grid.length}, 40px)`,
              gap: "4px",
            }}
          >
            {grid.map((row, ri) =>
              row.map((cell, ci) => renderGridCell(cell, ri, ci))
            )}
          </div>
          <div className="hidden lg:block w-20"></div>
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
