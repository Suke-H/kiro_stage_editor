// components/GridViewer.tsx
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { copyPanelListSlice } from "@/store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Grid,
  GridCell,
  GridCellKey,
  GRID_CELL_TYPES,
  CellSideInfo,
} from "@/types/grid";
import {
  Panel,
  PanelCellTypeKey,
  CopyPanel,
} from "@/types/panel";
import { StudioMode } from "@/types/store";

import { MatrixOperationPart } from "./grid/matrix-operation-part";
import { StageDataIOPart } from "./grid/stage-data-io-part";

export const GridViewer: React.FC = () => {
  const dispatch = useDispatch();

  /* ========== state ========== */
  const studioMode      = useSelector((s: RootState) => s.studioMode.studioMode);
  const grid            = useSelector((s: RootState) => s.grid.grid) as Grid;
  const gridHistory     = useSelector((s: RootState) => s.grid.gridHistory);
  const selectedCellKey = useSelector((s: RootState) => s.cellType.selectedCellType) as GridCellKey;
  const placementMode   = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);
  const copyPanels      = useSelector((s: RootState) => s.copyPanelList.panels);

  const handleGridCellClick = (rowIdx: number, colIdx: number): void => {
    const placing = placementMode.panel;           // Panel | CopyPanel | null

    /* 単セル配置モード */
    if (studioMode === StudioMode.Editor && !placing) {
      const def = GRID_CELL_TYPES[selectedCellKey];
      if (selectedCellKey === "Flip") {
        if (grid[rowIdx][colIdx].type !== "Empty") {
          dispatch(gridSlice.actions.flipCell({ row: rowIdx, col: colIdx }));
        }
      } else {
        const side: "neutral" | "front" = "neutral" in def ? "neutral" : "front";
        dispatch(
          gridSlice.actions.placeCell({
            row: rowIdx,
            col: colIdx,
            cell: { type: selectedCellKey, side },
          })
        );
      }

      // 単セル配置実施後は、履歴を初期化
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
      return;
    }

    /* パネル配置モード */

    // パネル未選択の場合、何もしない
    if (!placing) return;

    // 選択したパネルの情報取得
    const panelType = placing.type ?? "Normal";
    const rows = placing.cells.length;
    const cols = placing.cells[0].length;
    // コピーパネル
    const currentCopyPanel: CopyPanel | undefined =
      panelType === "Paste" ? copyPanels.find((cp) => cp.id === placing.id) : undefined;

    // 配置可能判定
    if (!canPlacePanel(grid, rowIdx, colIdx, placing, currentCopyPanel)) {
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
      return;
    }

    // パネル操作の前に、履歴保存
    // 履歴が1つもない場合は、初期化
    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }

    // Cut 用コピー配列初期化
    let copyCells: GridCell[][] = [];
    if (panelType === "Cut") {
      copyCells = placing.cells.map((row) =>
        row.map(() => ({ type: "Empty", side: "neutral" } as GridCell))
      );
    }

    // パネル配置実行
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const r = rowIdx + i;
        const c = colIdx + j;

        if (panelType === "Normal") {
          const t = placing.cells[i][j] as PanelCellTypeKey;
          if (t === "Black") {
            dispatch(gridSlice.actions.flipCell({ row: r, col: c }));
          } else if (t === "Flag") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Flag", side: "neutral" },
              })
            );
          } else if (t === "Cut") {
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
          dispatch(
            gridSlice.actions.placeCell({
              row: r,
              col: c,
              cell: { type: "Flag", side: "neutral" },
            })
          );
        }

        else if (panelType === "Cut") {
          if (placing.cells[i][j] === "Black") {
            copyCells[i][j] = { ...grid[r][c] };  // 完全コピー
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: "Empty", side: "neutral" },
              })
            );
          }
        }

        else if (panelType === "Paste" && currentCopyPanel) {
          const src = currentCopyPanel.cells[i][j];
          if (src.type !== "Empty") {
            dispatch(
              gridSlice.actions.placeCell({
                row: r,
                col: c,
                cell: { type: src.type, side: src.side },
              })
            );
          }
        }
      }
    }

    // パネルリストの更新
    if (panelType === "Paste" && currentCopyPanel) {
      dispatch(copyPanelListSlice.actions.placePanel(currentCopyPanel));
    } else {
      dispatch(panelListSlice.actions.placePanel(placing as Panel));
    }

    // Cut パネルの場合、コピーパネルを作成
    if (panelType === "Cut") {
      const newCopyPanel: CopyPanel = {
        id: `copy-${Date.now()}`,
        type: "Paste",
        cells: copyCells,
      };
      dispatch(copyPanelListSlice.actions.createPanel(newCopyPanel));
    }

    // パネル選択を解除
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
  };

  /* 配置可能判定 */
  const canPlacePanel = (
    g: Grid,
    r0: number,
    c0: number,
    p: Panel | CopyPanel,
    cp?: CopyPanel
  ): boolean => {
    const rows = p.cells.length;
    const cols = p.cells[0].length;

    if (r0 + rows > g.length || c0 + cols > g[0].length) return false;

    if (p.type === "Paste" && cp) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const src = cp.cells[i][j];
          if (src.type !== "Empty" && g[r0 + i][c0 + j].type !== "Empty") {
            return false;
          }
        }
      }
      return true;
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cellType = p.cells[i][j] as PanelCellTypeKey;
        if (cellType === "Black" && g[r0 + i][c0 + j].type === "Empty") {
          return false;
        }
      }
    }
    return true;
  };

  const renderGridCell = (cell: GridCell, r: number, c: number) => {
    const def = GRID_CELL_TYPES[cell.type];
    const sideInfo: CellSideInfo | undefined = def[cell.side];

    return (
      <div
        key={`${r}-${c}`}
        className={`relative h-10 w-10 flex items-center justify-center ${
          cell.type === "Empty" ? "" : "border"
        }`}
        onClick={() => handleGridCellClick(r, c)}
      >
        {cell.type !== "Empty" && sideInfo && (
          <img
            src={`/cells/${sideInfo.picture}`}
            alt={def.label}
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
