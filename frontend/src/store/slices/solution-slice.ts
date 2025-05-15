// src/store/slices/solution-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelPlacement } from "@/types/panel-placement";
import { NumberGrid } from "@/types/solution";
import { SolutionState } from "@/types/store/states";

const initialState: SolutionState = {
  solutions: [],
  currentIndex: -1,
  numberGrid: [],
};

const solutionSlice = createSlice({
  name: "solution",
  initialState,
  reducers: {
    /** 解のリストを受け取る */
    setSolutions(state, action: PayloadAction<PanelPlacement[][]>) {
      state.solutions = action.payload;
      state.currentIndex = action.payload.length > 0 ? 0 : -1;
    },

    /** 何通り目を見るか */
    setCurrentSolutionIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
    },

    /** numberGrid を再計算する   */
    buildNumberGrid(
      state,
      action: PayloadAction<{ rows: number; cols: number }>
    ) {
      const { rows, cols } = action.payload;
      const placements = state.solutions[state.currentIndex] ?? [];
      const newGrid: NumberGrid = Array.from({ length: rows }, () =>
        Array(cols).fill(null)
      );

      placements.forEach((placement, idx) => {
        const { point } = placement;

        newGrid[point.x][point.y] = idx + 1; // 1-origin
      });

      state.numberGrid = newGrid;
    },

    /** 全クリア */
    clearSolutions(state) {
      state.solutions = [];
      state.currentIndex = -1;
      state.numberGrid = [];
    },
  },
});

export const solutionActions = solutionSlice.actions; 
export default solutionSlice.reducer;                