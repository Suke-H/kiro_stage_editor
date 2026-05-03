import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { RootState } from "@/store";
import { gridSlice } from "@/store/slices/grid-slice";
import { clearMoveTarget, setMoveTarget } from "@/store/slices/move-slice";
import { clearSwapTarget } from "@/store/slices/swap-slice";
import { Grid } from "@/types/grid";
import { bfsAllShortestPaths } from "@/logic/pathfinding/bfs";
import { createMoveTransitionGrid } from "@/logic/pathfinding/move-transition";

export const useMovePositionHandler = () => {
  const dispatch = useDispatch();
  const grid = useSelector((state: RootState) => state.grid.grid) as Grid;
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  const phaseHistory = useSelector((state: RootState) => state.grid.phaseHistory);
  const moveState = useSelector((state: RootState) => state.move);

  const saveHistory = () => {
    if (gridHistory.length === 0) {
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
    } else {
      dispatch(gridSlice.actions.saveHistory());
    }
  };

  const selectFirstMoveTarget = (rowIdx: number, colIdx: number) => {
    dispatch(clearSwapTarget());
    dispatch(setMoveTarget({ row: rowIdx, col: colIdx }));
  };

  const selectSecondMoveTarget = (rowIdx: number, colIdx: number) => {
    const clickedCell = grid[rowIdx][colIdx];

    if (
      clickedCell.type === "Empty" ||
      clickedCell.type === "Normal" ||
      clickedCell.type === "MoveCell"
    ) {
      toast.error("このセルは移動できません。");
      dispatch(clearMoveTarget());
      return;
    }

    const first = moveState.moveTarget!;
    const source = { x: colIdx, y: rowIdx };
    const destination = { x: first.col, y: first.row };
    const inverted = clickedCell.side === "back";

    const paths = bfsAllShortestPaths(grid, source, destination, inverted);
    if (paths.length === 0) {
      toast.error("移動経路が見つかりませんでした。");
      dispatch(clearMoveTarget());
      return;
    }

    saveHistory();
    const newGrid = createMoveTransitionGrid(grid, source, destination, phaseHistory);
    dispatch(gridSlice.actions.replaceGrid(newGrid));
    toast.success("移動しました。");
    dispatch(clearMoveTarget());
  };

  return {
    selectFirstMoveTarget,
    selectSecondMoveTarget,
    hasMoveTarget: !!moveState.moveTarget,
    isMoveTarget: (r: number, c: number) =>
      moveState.moveTarget?.row === r && moveState.moveTarget?.col === c,
  };
};
