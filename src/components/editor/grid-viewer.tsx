import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { copyPanelListSlice } from "@/store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { useSwapHandler } from "@/hooks/useSwapHandler";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Grid, GridCell, GridCellKey, GRID_CELL_TYPES, CellSideInfo } from "@/types/grid";
import { Panel, CopyPanel } from "@/types/panel";
import { canPlacePanelAt, applyPanelAt } from "@/logic/panels";
import { StudioMode } from "@/types/store";

import { MatrixOperationPart } from "./grid/matrix-operation-part";
import { StageDataIOPart } from "./grid/stage-data-io-part";

export const GridViewer: React.FC = () => {
  const dispatch = useDispatch();

  const studioMode      = useSelector((s: RootState) => s.studioMode.studioMode);
  const grid            = useSelector((s: RootState) => s.grid.grid) as Grid;
  const gridHistory     = useSelector((s: RootState) => s.grid.gridHistory);
  const selectedCellKey = useSelector((s: RootState) => s.cellType.selectedCellType) as GridCellKey;
  const selectedSide    = useSelector((s: RootState) => s.cellType.selectedSide);
  const placementMode   = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);
  const copyPanels      = useSelector((s: RootState) => s.copyPanelList.copyPanels);
  const { handleSwap, isSwapTarget } = useSwapHandler();

  const handleGridCellClick = (rowIdx: number, colIdx: number): void => {
    const placing = placementMode.panel;           // Panel | CopyPanel | null

    /* 単セル配置モード */
    if (studioMode === StudioMode.Editor && !placing) {
      if (selectedCellKey === "Flip") {
        if (grid[rowIdx][colIdx].type !== "Empty") {
          dispatch(gridSlice.actions.flipCell({ row: rowIdx, col: colIdx }));
        }
      } else {
        const side = selectedSide;
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

    // Swapパネルの場合は専用ハンドラに処理を委譲
    if (panelType === "Swap") {
      handleSwap(rowIdx, colIdx, placing as Panel);
      return;
    }

    // コピーパネル
    const currentCopyPanel: CopyPanel | undefined =
      panelType === "Paste" ? copyPanels.find((cp) => cp.id === placing.id) : undefined;

    const panelToApply = panelType === "Paste" && currentCopyPanel ? currentCopyPanel : placing;

    // 配置可能判定
    if (!canPlacePanelAt(grid, rowIdx, colIdx, panelToApply)) {
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
      return;
    }

    // パネル操作の前に、履歴保存
    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }

    // パネル配置実行（Strategy Pattern使用）
    const [newGrid, createdCopyPanel] = applyPanelAt(grid, rowIdx, colIdx, panelToApply);

    // gridを更新
    dispatch(gridSlice.actions.replaceGrid(newGrid));

    // パネルリストの更新
    if (panelType === "Paste" && currentCopyPanel) {
      dispatch(copyPanelListSlice.actions.placePanel(currentCopyPanel));
    } else {
      dispatch(panelListSlice.actions.placePanel(placing as Panel));
    }

    // Cutパネルで生成されたCopyPanelをstoreに追加
    if (createdCopyPanel) {
      dispatch(copyPanelListSlice.actions.createPanel(createdCopyPanel));
    }

    // パネル選択を解除
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
  };

  const renderGridCell = (cell: GridCell, r: number, c: number) => {
    const def = GRID_CELL_TYPES[cell.type];
    const sideInfo: CellSideInfo | undefined = def[cell.side];

    return (
      <div
        key={`${r}-${c}`}
        className={`relative h-10 w-10 flex items-center justify-center ${
          cell.type === "Empty" ? "" : "border"
        } ${isSwapTarget(r, c) ? "ring-2 ring-red-500" : ""}`}
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
