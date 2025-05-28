import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import { gridSlice } from "../../store/slices/grid-slice";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { copyPanelListSlice } from "../../store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";

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
  CopyPanel,
  PanelCellTypeKey,
} from "@/types/panel";

import { StudioMode } from "@/types/store";
import { MatrixOperationPart } from "./grid/matrix-operation-part";
import { StageDataIOPart } from "./grid/stage-data-io-part";

// /* PanelCell -> GridCell 変換（Cut 用コピー生成） */
// const panelCellToGrid = (cell: PanelCellTypeKey): GridCell => ({
//   type: cell === "Black" ? "Normal" : "Empty",
//   side: "neutral",
// });

export const GridViewer: React.FC = () => {
  const dispatch = useDispatch();

  const studioMode   = useSelector((s: RootState) => s.studioMode.studioMode);
  const grid: Grid   = useSelector((s: RootState) => s.grid.grid);
  const selCell      = useSelector((s: RootState) => s.cellType.selectedCellType) as GridCellKey;
  const placement    = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);
  const copyPanels   = useSelector((s: RootState) => s.copyPanelList.panels);

  /* クリック処理 */
  const handleGridCellClick = (ri: number, ci: number) => {
    const placing = placement.panel; // Panel | CopyPanel | null

    /* セル個別配置 (Editor & 未選択) */
    if (studioMode === StudioMode.Editor && !placing) {
      const def = GRID_CELL_TYPES[selCell];
      if (selCell === "Flip") {
        if (grid[ri][ci].type !== "Empty") {
          dispatch(gridSlice.actions.flipCell({ row: ri, col: ci }));
        }
      } else {
        const side = "neutral" in def ? "neutral" : "front";
        dispatch(
          gridSlice.actions.placeCell({
            row: ri,
            col: ci,
            cell: { type: selCell, side },
          })
        );
      }
      return;
    }

    /* パネル未選択 */
    if (!placing) return;

    const panelType = placing.type ?? "Normal";
    const rows = placing.cells.length;
    const cols = placing.cells[0].length;

    /* ----- Paste 用 CopyPanel を取得 ----- */
    const cp =
      panelType === "Paste"
        ? copyPanels.find((c) => c.id === placing.id)
        : undefined;

    /* 範囲 & 空きチェック */
    if (!canPlace(grid, ri, ci, placing, cp)) {
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
      return;
    }

    dispatch(gridSlice.actions.saveHistory());

    /* Cut 時のコピー生成バッファ */
    let copyCells: GridCell[][] = [];
    if (panelType === "Cut") {
      copyCells = placing.cells.map((row) =>
        row.map(() => ({ type: "Empty", side: "neutral" } as GridCell))
      );
    }

    /* -------------------------------------------------- */
    /* 各セルごと処理                                     */
    /* -------------------------------------------------- */
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const r = ri + i;
        const c = ci + j;

        if (panelType === "Normal") {
          const t = placing.cells[i][j] as PanelCellTypeKey;
          if (t === "Black") dispatch(gridSlice.actions.flipCell({ row: r, col: c }));
          else if (t === "Flag")
            dispatch(gridSlice.actions.placeCell({ row: r, col: c, cell: { type: "Flag", side: "neutral" } }));
          else if (t === "Cut")
            dispatch(gridSlice.actions.placeCell({ row: r, col: c, cell: { type: "Empty", side: "neutral" } }));
        }

        else if (panelType === "Flag") {
          dispatch(gridSlice.actions.placeCell({ row: r, col: c, cell: { type: "Flag", side: "neutral" } }));
        }

        else if (panelType === "Cut") {
          const t = placing.cells[i][j] as PanelCellTypeKey;
          if (t === "Black") {
            copyCells[i][j] = grid[r][c];
            dispatch(gridSlice.actions.placeCell({ row: r, col: c, cell: { type: "Empty", side: "neutral" } }));
          }
        }

        else if (panelType === "Paste" && cp) {
          const src = cp.cells[i][j];
          if (src.type !== "Empty") {
            dispatch(gridSlice.actions.placeCell({ row: r, col: c, cell: { type: src.type, side: src.side } }));
          }
        }
      }
    }

    /* ----- 使用済みパネルをリストから削除 ----- */
    if (panelType === "Paste" && cp) {
      dispatch(copyPanelListSlice.actions.placePanel(cp));
    } else {
      dispatch(panelListSlice.actions.placePanel(placing as Panel));
    }

    /* ----- Cut → CopyPanel 作成 ----- */
    if (panelType === "Cut") {
      const newCopy: CopyPanel = {
        id: `copy-${Date.now()}`,
        type: "Paste",
        cells: copyCells,
      };
      dispatch(copyPanelListSlice.actions.createPanel(newCopy));
    }

    /* 選択解除 */
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
  };

  /* 配置可否 */
  const canPlace = (
    g: Grid,
    ri: number,
    ci: number,
    p: Panel | CopyPanel,
    cp?: CopyPanel
  ) => {
    const rows = p.cells.length;
    const cols = p.cells[0].length;

    if (ri + rows > g.length || ci + cols > g[0].length) return false;

    if (p.type === "Paste" && cp) {
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++)
          if (
            cp.cells[i][j].type !== "Empty" &&
            g[ri + i][ci + j].type !== "Empty"
          )
            return false;
      return true;
    }

    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++)
        if (
          p.cells[i][j] === "Black" &&
          g[ri + i][ci + j].type === "Empty"
        )
          return false;
    return true;
  };

  /* セル描画 (変更なし) */
  const renderCell = (cell: GridCell, r: number, c: number) => {
    const def = GRID_CELL_TYPES[cell.type];
    const side: CellSideInfo | undefined = def[cell.side];
    return (
      <div
        key={`${r}-${c}`}
        className={`relative h-10 w-10 flex items-center justify-center ${
          cell.type === "Empty" ? "" : "border"
        }`}
        onClick={() => handleGridCellClick(r, c)}
      >
        {cell.type !== "Empty" && (
          <img
            src={`/cells/${side?.picture}`}
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
            {grid.map((row, ri) => row.map((cell, ci) => renderCell(cell, ri, ci)))}
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
