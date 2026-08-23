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
import { Grid, GridCell } from "@/types/grid";
import { swapGridCells } from "@/logic/grid-utils";

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
    if (
      clickedCell.type === "Normal" ||
      clickedCell.type === "Empty" ||
      clickedCell.type === "Start"
    ) {
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
    if (
      clickedCell.type === "Empty" ||
      clickedCell.type === "Normal" ||
      clickedCell.type === "SwapCell" ||
      clickedCell.type === "Start"
    ) {
      dispatch(clearSwapTarget());
      return;
    }

    saveHistory();

    const first = swapState.swapTarget!;
    let targetGrid = grid;

    // 入れ替えマスは削除する（一度きり）
    if (grid[first.row][first.col].type === "SwapCell") {
      targetGrid = vanishSwapCell(grid, first);
    }

    const newGrid = swapGridCells(targetGrid, first, { row: rowIdx, col: colIdx });

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

  const vanishSwapCell = (grid: Grid, target: { row: number; col: number }): Grid => {
    return grid.map((row, r) =>
      row.map((cell, c) =>
        r === target.row && c === target.col
          ? ({ type: "Normal", side: "front" } as GridCell)
          : cell
      )
    );
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
