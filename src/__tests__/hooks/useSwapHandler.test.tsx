import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it } from "vitest";

import { useSwapHandler } from "@/hooks/useSwapHandler";
import { store } from "@/store";
import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { clearSwapOperations, clearSwapTarget } from "@/store/slices/swap-slice";
import { Panel } from "@/types/panel";
import { gridFrom } from "../logic/test-utils";

const swapPanel: Panel = {
  id: "swap-panel",
  cells: [["Swap"]],
  type: "Swap",
};

const wrapper = ({ children }: React.PropsWithChildren) => (
  <Provider store={store}>{children}</Provider>
);

describe("useSwapHandler", () => {
  beforeEach(() => {
    store.dispatch(panelListSlice.actions.reset());
    store.dispatch(panelListSlice.actions.loadPanels([swapPanel]));
    store.dispatch(panelPlacementSlice.actions.clearPanelSelection());
    store.dispatch(clearSwapTarget());
    store.dispatch(clearSwapOperations());
  });

  it("入れ替えパネルによる交換が成功したときパネルを消費する", () => {
    store.dispatch(gridSlice.actions.loadGrid(gridFrom(["SG"])));
    store.dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: swapPanel,
        highlightedCell: { row: 0, col: 0 },
      })
    );
    const { result } = renderHook(() => useSwapHandler(), { wrapper });

    act(() => result.current.selectFirstSwapTarget(0, 0));
    act(() => result.current.selectSecondSwapTarget(0, 1));

    expect(store.getState().panelList.panels).toEqual([]);
    expect(store.getState().panelPlacement.panelPlacementMode.panel).toBeNull();
    expect(store.getState().grid.grid[0].map((cell) => cell.type)).toEqual(["Goal", "Start"]);
  });

  it("盤面の入れ替えマスによる交換では所持パネルを消費しない", () => {
    const grid = gridFrom([".G"]);
    grid[0][0] = { type: "SwapCell", side: "neutral" };
    store.dispatch(gridSlice.actions.loadGrid(grid));
    const { result } = renderHook(() => useSwapHandler(), { wrapper });

    act(() => result.current.selectFirstSwapTarget(0, 0));
    act(() => result.current.selectSecondSwapTarget(0, 1));

    expect(store.getState().panelList.panels).toEqual([swapPanel]);
  });

  it("Startを1つ目の入れ替え対象にできない", () => {
    store.dispatch(gridSlice.actions.loadGrid(gridFrom(["SG"])));
    store.dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: swapPanel,
        highlightedCell: { row: 0, col: 0 },
      })
    );
    const { result } = renderHook(() => useSwapHandler(), { wrapper });

    act(() => result.current.selectFirstSwapTarget(0, 0));

    expect(result.current.hasSwapTarget).toBe(false);
    expect(store.getState().panelList.panels).toEqual([swapPanel]);
  });

  it("Startを2つ目の入れ替え対象にできない", () => {
    store.dispatch(gridSlice.actions.loadGrid(gridFrom(["GS"])));
    store.dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: swapPanel,
        highlightedCell: { row: 0, col: 0 },
      })
    );
    const { result } = renderHook(() => useSwapHandler(), { wrapper });

    act(() => result.current.selectFirstSwapTarget(0, 0));
    act(() => result.current.selectSecondSwapTarget(0, 1));

    expect(store.getState().grid.grid[0].map((cell) => cell.type)).toEqual(["Goal", "Start"]);
    expect(store.getState().panelList.panels).toEqual([swapPanel]);
    expect(store.getState().swap.operations).toEqual([]);
  });
});
