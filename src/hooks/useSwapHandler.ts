import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { gridSlice } from "@/store/slices/grid-slice";
import { setSwapTarget, clearSwapTarget } from "@/store/slices/swap-slice";
import { Grid, GridCell } from "@/types/grid";
import { swapGridCells } from "@/logic/grid-utils";

export const useSwapHandler = () => {
  const dispatch = useDispatch();
  const grid = useSelector((s: RootState) => s.grid.grid) as Grid;
  const gridHistory = useSelector((s: RootState) => s.grid.gridHistory);
  const swapState = useSelector((s: RootState) => s.swap);

  const saveHistory = () => {
    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }
  };

  const selectFirstSwapTarget = (rowIdx: number, colIdx: number) => {
    dispatch(setSwapTarget({ row: rowIdx, col: colIdx }));
  };

  const selectSecondSwapTarget = (rowIdx: number, colIdx: number) => {
    saveHistory();

    const first = swapState.swapTarget!;
    let targetGrid = grid;

    // 入れ替えマスは削除する（一度きり）
    if (grid[first.row][first.col].type === "SwapCell") {
      targetGrid = vanishSwapCell(grid, first);
    }

    const newGrid = swapGridCells(targetGrid, first, { row: rowIdx, col: colIdx });

    dispatch(gridSlice.actions.replaceGrid(newGrid));
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