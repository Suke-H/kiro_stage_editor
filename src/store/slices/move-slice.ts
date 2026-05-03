import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MoveState } from "@/types/store/states";

const initialState: MoveState = {
  moveTarget: null,
};

const moveSlice = createSlice({
  name: "move",
  initialState,
  reducers: {
    setMoveTarget: (state, action: PayloadAction<{ row: number; col: number }>) => {
      state.moveTarget = action.payload;
    },
    clearMoveTarget: (state) => {
      state.moveTarget = null;
    },
  },
});

export const { setMoveTarget, clearMoveTarget } = moveSlice.actions;
export default moveSlice.reducer;
