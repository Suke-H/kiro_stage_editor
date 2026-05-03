import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { copyPanelListSlice } from "@/store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { useSwapHandler } from "@/hooks/useSwapHandler";
import { useMovePointHandler } from "@/hooks/useMovePointHandler";

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
  const { selectFirstSwapTarget, selectSecondSwapTarget, hasSwapTarget, isSwapTarget } = useSwapHandler();
  const { selectFirstMoveTarget, selectSecondMoveTarget, hasMoveTarget, isMoveTarget } = useMovePointHandler();

  const handleGridCellClick = (rowIdx: number, colIdx: number): void => {
    const placing = placementMode.panel;

    if (hasMoveTarget) {
      selectSecondMoveTarget(rowIdx, colIdx);
      return;
    }

    if (hasSwapTarget) {
      selectSecondSwapTarget(rowIdx, colIdx);
      return;
    }

    if (studioMode === StudioMode.Play && grid[rowIdx][colIdx].type === "MovePoint") {
      selectFirstMoveTarget(rowIdx, colIdx);
      return;
    }

    if (studioMode === StudioMode.Play && grid[rowIdx][colIdx].type === "SwapCell") {
      selectFirstSwapTarget(rowIdx, colIdx);
      return;
    }

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

      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
      return;
    }

    if (!placing) return;

    const panelType = placing.type ?? "Normal";

    if (panelType === "Swap") {
      selectFirstSwapTarget(rowIdx, colIdx);
      return;
    }

    const currentCopyPanel: CopyPanel | undefined =
      panelType === "Paste" ? copyPanels.find((cp) => cp.id === placing.id) : undefined;

    const panelToApply = panelType === "Paste" && currentCopyPanel ? currentCopyPanel : placing;

    if (!canPlacePanelAt(grid, rowIdx, colIdx, panelToApply)) {
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
      return;
    }

    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }

    const [newGrid, createdCopyPanel] = applyPanelAt(grid, rowIdx, colIdx, panelToApply);

    dispatch(gridSlice.actions.replaceGrid(newGrid));

    if (panelType === "Paste" && currentCopyPanel) {
      dispatch(copyPanelListSlice.actions.placePanel(currentCopyPanel));
    } else {
      dispatch(panelListSlice.actions.placePanel(placing as Panel));
    }

    if (createdCopyPanel) {
      dispatch(copyPanelListSlice.actions.createPanel(createdCopyPanel));
    }

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
        } ${isSwapTarget(r, c) || isMoveTarget(r, c) ? "ring-2 ring-red-500" : ""}`}
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
