import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelPlacement } from "@/types/panel-placement";
import { NumberGrid } from "@/types/solution";

type SolutionState = {
  /** ソルバが返した解そのもの */
  solutions: PanelPlacement[][];      // [ 解1, 解2, … ]
  /** 各解ごとの numberGrid（行=y / 列=x で計算済み） */
  numberGrids: NumberGrid[];          // solutions と同じ長さ
};

const initialState: SolutionState = {
  solutions: [],
  numberGrids: [],
};

/* ─────────────────────────────────────────── */

const buildNumberGrid = (
  placements: PanelPlacement[],
  rows: number,
  cols: number,
): NumberGrid => {
  const g: NumberGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );
  placements.forEach((p, i) => {
    g[p.point.y][p.point.x] = i + 1; // ★ row = y, col = x
  });
  return g;
};

/* ─────────────────────────────────────────── */

const solutionSlice = createSlice({
  name: "solution",
  initialState,
  reducers: {
    /** 解を保存（まだ numberGrid は作らない） */
    setSolutions(state, action: PayloadAction<PanelPlacement[][]>) {
      state.solutions = action.payload;
      state.numberGrids = [];               // クリア
    },

    /** 盤面サイズを渡して *全部* の numberGrid を生成 */
    buildNumberGrids(
      state,
      action: PayloadAction<{ rows: number; cols: number }>,
    ) {
      const { rows, cols } = action.payload;
      state.numberGrids = state.solutions.map((placements) =>
        buildNumberGrid(placements, rows, cols),
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
