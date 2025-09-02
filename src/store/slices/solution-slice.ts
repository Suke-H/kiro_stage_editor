import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { PanelPlacement, PhasedSolution } from "@/types/panel-placement";
import { NumberGrid } from "@/types/solution";
import { Grid } from "@/types/grid";
import { Panel } from "@/types/panel";
import { solvePuzzle } from "@/logic";

export const solvePuzzleAsync = createAsyncThunk(
  'solution/solve',
  async ({ grid, panels, minimizePanels }: { 
    grid: Grid, 
    panels: Panel[], 
    minimizePanels: boolean 
  }) => {
    // UIの更新を可能にするため、少し待機
    await new Promise(resolve => setTimeout(resolve, 10));
    const response = solvePuzzle(grid, panels, minimizePanels);
    return response.solutions;
  }
);

type SolverStatus = 'not_executed' | 'loading' | 'success' | 'error';

type SolutionState = {
  solutions: PhasedSolution[];
  numberGrids: NumberGrid[];
  status: SolverStatus;
  error: string | null;
};

const initialState: SolutionState = {
  solutions: [],
  numberGrids: [],
  status: 'not_executed',
  error: null,
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

    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(solvePuzzleAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(solvePuzzleAsync.fulfilled, (state, action) => {
        state.status = 'success';
        state.solutions = action.payload;
      })
      .addCase(solvePuzzleAsync.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || '解の探索に失敗しました';
      });
  },
});

export const solutionActions = solutionSlice.actions;
export default solutionSlice.reducer;
