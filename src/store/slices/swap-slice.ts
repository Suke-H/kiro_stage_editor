import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SwapState {
  swapTarget: { row: number; col: number } | null;
}

const initialState: SwapState = {
  swapTarget: null,
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setSwapTarget: (state, action: PayloadAction<{ row: number; col: number }>) => {
      state.swapTarget = action.payload;
    },
    clearSwapTarget: (state) => {
      state.swapTarget = null;
    },
  },
});

export const { setSwapTarget, clearSwapTarget } = swapSlice.actions;
export default swapSlice.reducer;
