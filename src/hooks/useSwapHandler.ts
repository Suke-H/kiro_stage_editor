import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { setSwapTarget, clearSwapTarget } from "@/store/slices/swap-slice";
import { Panel } from "@/types/panel";
import { canPlacePanelAt, applyPanelAt } from "@/logic/panels";
import { Grid } from "@/types/grid";

export const useSwapHandler = () => {
  const dispatch = useDispatch();
  const grid = useSelector((s: RootState) => s.grid.grid) as Grid;
  const gridHistory = useSelector((s: RootState) => s.grid.gridHistory);
  const swapState = useSelector((s: RootState) => s.swap);

  const handleSwap = (rowIdx: number, colIdx: number, placing: Panel) => {
    const panelToApply = swapState.swapTarget
      ? { ...placing, type: "SwapSecond" as const }
      : placing;

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

    const [newGrid, , swapInfo] = applyPanelAt(grid, rowIdx, colIdx, panelToApply);
    dispatch(gridSlice.actions.replaceGrid(newGrid));

    if (swapInfo?.swapAction === "set") {
      dispatch(setSwapTarget(swapInfo.pos!));
    } else if (swapInfo?.swapAction === "clear") {
      dispatch(clearSwapTarget());
    }

    if (swapState.swapTarget) {
      dispatch(panelListSlice.actions.placePanel(placing));
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
    }
  };

  const isSwapTarget = (r: number, c: number) =>
    swapState.swapTarget?.row === r && swapState.swapTarget?.col === c;

  return { handleSwap, isSwapTarget };
};
