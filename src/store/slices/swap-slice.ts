import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SwapState {
  swapTarget: { row: number; col: number } | null;
  swapPanelId: string | null;
}

const initialState: SwapState = {
  swapTarget: null,
  swapPanelId: null,
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
  },
});

export const { setSwapTarget, clearSwapTarget } = swapSlice.actions;
export default swapSlice.reducer;
