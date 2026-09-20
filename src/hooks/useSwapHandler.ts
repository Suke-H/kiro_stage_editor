import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import {
  setSwapTarget,
  clearSwapTarget,
  recordSwapOperation,
} from "@/store/slices/swap-slice";
import { clearMoveTarget } from "@/store/slices/move-slice";
import { Grid } from "@/types/grid";
import {
  applySwapPanel,
  canSelectFirstSwapTarget,
  canSelectSecondSwapTarget,
} from "@/logic/swap-panel-operations";

export const useSwapHandler = () => {
  const dispatch = useDispatch();
  const grid = useSelector((s: RootState) => s.grid.grid) as Grid;
  const gridHistory = useSelector((s: RootState) => s.grid.gridHistory);
  const swapState = useSelector((s: RootState) => s.swap);
  const panels = useSelector((s: RootState) => s.panelList.panels);
  const selectedPanel = useSelector(
    (s: RootState) => s.panelPlacement.panelPlacementMode.panel
  );

  const saveHistory = () => {
    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }
  };

  const selectFirstSwapTarget = (rowIdx: number, colIdx: number) => {
    const clickedCell = grid[rowIdx][colIdx];
    if (!canSelectFirstSwapTarget(clickedCell)) {
      dispatch(clearSwapTarget());
      return;
    }

    dispatch(clearMoveTarget());
    dispatch(
      setSwapTarget({
        row: rowIdx,
        col: colIdx,
        panelId: selectedPanel?.type === "Swap" ? selectedPanel.id : undefined,
      })
    );
  };

  const selectSecondSwapTarget = (rowIdx: number, colIdx: number) => {
    const clickedCell = grid[rowIdx][colIdx];
    const isSameTarget =
      swapState.swapTarget?.row === rowIdx && swapState.swapTarget?.col === colIdx;
    if (isSameTarget || !canSelectSecondSwapTarget(clickedCell)) {
      dispatch(clearSwapTarget());
      return;
    }

    saveHistory();

    const first = swapState.swapTarget!;
    const newGrid = applySwapPanel(grid, first, { row: rowIdx, col: colIdx });

    dispatch(gridSlice.actions.replaceGrid(newGrid));
    dispatch(
      recordSwapOperation({
        first,
        second: { row: rowIdx, col: colIdx },
        historyDepth: gridHistory.length + 1,
      })
    );

    const usedSwapPanel = panels.find((panel) => panel.id === swapState.swapPanelId);
    if (usedSwapPanel) {
      dispatch(panelListSlice.actions.placePanel(usedSwapPanel));
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
    }

    dispatch(clearSwapTarget());
  };

  const selectSwapCell = (rowIdx: number, colIdx: number) => {
    selectFirstSwapTarget(rowIdx, colIdx);
  };

  const isSwapTarget = (r: number, c: number) =>
    swapState.swapTarget?.row === r && swapState.swapTarget?.col === c;

  return {
    selectFirstSwapTarget,
    selectSecondSwapTarget,
    selectSwapCell,
    hasSwapTarget: !!swapState.swapTarget,
    isSwapTarget,
  };
};
