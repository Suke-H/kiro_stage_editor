import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SwapOperation } from "@/logic/grid-utils";

export interface SwapState {
  swapTarget: { row: number; col: number } | null;
  swapPanelId: string | null;
  operations: SwapOperation[];
}

const initialState: SwapState = {
  swapTarget: null,
  swapPanelId: null,
  operations: [],
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setSwapTarget: (
      state,
      action: PayloadAction<{ row: number; col: number; panelId?: string }>
    ) => {
      const { row, col, panelId } = action.payload;
      state.swapTarget = { row, col };
      state.swapPanelId = panelId ?? null;
    },
    clearSwapTarget: (state) => {
      state.swapTarget = null;
      state.swapPanelId = null;
    },
    recordSwapOperation: (state, action: PayloadAction<SwapOperation>) => {
      state.operations.push(action.payload);
    },
    undoSwapOperation: (state, action: PayloadAction<number>) => {
      state.operations = state.operations.filter(
        (operation) => operation.historyDepth !== action.payload
      );
    },
    clearSwapOperations: (state) => {
      state.operations = [];
    },
  },
});

export const {
  setSwapTarget,
  clearSwapTarget,
  recordSwapOperation,
  undoSwapOperation,
  clearSwapOperations,
} = swapSlice.actions;
export default swapSlice.reducer;
