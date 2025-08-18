import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelPlacement, PhasedSolution } from "@/types/panel-placement";
import { NumberGrid } from "@/types/solution";

type SolutionState = {
  solutions: PhasedSolution[];
  numberGrids: NumberGrid[]; 
};

const initialState: SolutionState = {
  solutions: [],
  numberGrids: [],
};

const buildNumberGrid = (
  placements: PanelPlacement[],
  rows: number,
  cols: number,
): NumberGrid => {
  const g: NumberGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );
  placements.forEach((p, i) => {
    g[p.point.y][p.point.x] = i + 1;
  });
  return g;
};

const solutionSlice = createSlice({
  name: "solution",
  initialState,
  reducers: {
    /** 解を保存（まだ numberGrid は作らない） */
    setSolutions(state, action: PayloadAction<PhasedSolution[]>) {
      state.solutions = action.payload;
      state.numberGrids = [];               // クリア
    },

    /** 盤面サイズを渡して *全部* の numberGrid を生成 */
    buildNumberGrids(
      state,
      action: PayloadAction<{ rows: number; cols: number }>,
    ) {
      const { rows, cols } = action.payload;
      state.numberGrids = state.solutions.flatMap((phasedSolution) =>
        phasedSolution.phases.map((placements) =>
          buildNumberGrid(placements, rows, cols)
        )
      );
    },

    /** 全クリア */
    clearSolutions(state) {
      state.solutions = [];
      state.numberGrids = [];
    },
  },
});

export const solutionActions = solutionSlice.actions;
export default solutionSlice.reducer;
