import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Grid, GridCell } from "@/types/grid";
import { GridState } from "@/types/store/states";
import { Path } from "@/types/path";
import { GridCellKey } from "@/types/grid/schema";


const initialState: GridState = {
    grid: [
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
    ],
    gridHistory: [],
    phaseHistory: [],
}

export const gridSlice = createSlice({
  name: "grid",
  initialState,
  reducers: {

    // 初期化
    initGrid: (state) => {
        state.grid = [
            [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
            [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
            [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
        ];
    },

    // ロード
    loadGrid: (state, action: PayloadAction<Grid>) => {
        state.grid = action.payload;
    },

    // 行列の追加・削除
    addToRow: (state, action: PayloadAction<{ isFirst: boolean }>) => {
        if (action.payload.isFirst) {
            state.grid.unshift(Array(state.grid[0].length).fill({ type: 'Normal', side: 'front' }));
        } else {
            state.grid.push(Array(state.grid[0].length).fill({ type: 'Normal', side: 'front' }));
        }
    },
    addToCol: (state, action: PayloadAction<{ isFirst: boolean }>) => {
        if (action.payload.isFirst) {
            state.grid = state.grid.map((row) => [ { type: 'Normal', side: 'front' }, ...row ]);
        } else {
            state.grid = state.grid.map((row) => [ ...row, { type: 'Normal', side: 'front' } ]);
        }
    },
    removeFromRow: (state, action: PayloadAction<{ isFirst: boolean }>) => {
        if (action.payload.isFirst) {
            state.grid.shift();
        } else {
            state.grid.pop();
        }
    },
    removeFromCol: (state, action: PayloadAction<{ isFirst: boolean }>) => {
        if (action.payload.isFirst) {
            state.grid = state.grid.map((row) => row.slice(1));
        } else {
            state.grid = state.grid.map((row) => row.slice(0, -1));
        }
    },

    // セル操作
    placeCell: (state, action: PayloadAction<{ row: number; col: number; cell: GridCell }>) => {
        const { row, col, cell } = action.payload;
        state.grid[row][col] = cell;
    },
    flipCell: (state, action: PayloadAction<{ row: number; col: number }>) => {
        const { row, col } = action.payload;
        // ニュートラルの場合、反転しない
        if (state.grid[row][col].side === 'neutral') return;
        // それ以外(front/back)の場合、反転
        state.grid[row][col].side = state.grid[row][col].side === 'front' ? 'back' : 'front';
    },

    /* 配置履歴の管理 */

    // 履歴を今のグリッドで初期化
    initHistory: (state) => {
        state.gridHistory = [state.grid.map((row) => row.map((cell) => ({ ...cell })))];
    },

    // 現在のグリッドを履歴に追加
    saveHistory: (state) => {
        state.gridHistory.push(state.grid.map((row) => row.map((cell) => ({ ...cell }))));
    },

    // undo, resetは最初の履歴は消さずに持っておく
    undo: (state) => {
        if (state.gridHistory.length >= 2) {
            state.grid = state.gridHistory[state.gridHistory.length - 1];
            state.gridHistory.pop();
        }
    },

    reset: (state) => {
        if (state.gridHistory.length >= 2) {
            state.grid = state.gridHistory[0];
            // 最初の履歴は消さない
            state.gridHistory = state.gridHistory.slice(0, 1);
        }
    },

    /* フェーズ履歴の管理 */

    // フェーズ履歴を初期化 
    initPhaseHistory: (state) => {
        state.phaseHistory = [state.grid.map((row) => row.map((cell) => ({ ...cell })))];
    },

    savePhaseHistory: (state) => {
        state.phaseHistory.push(state.grid.map((row) => row.map((cell) => ({ ...cell }))));
    },

    // resetは最初の履歴は消さずに持っておく
    resetPhase: (state) => {
        if (state.phaseHistory.length >= 2) {
            state.grid = state.phaseHistory[0];
            // 最初の履歴は消さない
            state.phaseHistory = state.phaseHistory.slice(0, 1);
        }
    },

    // 足あとの設置
    placeFootprints: (state, action: PayloadAction<{path: Path}>) => {
      const {  path } = action.payload;
      // ループ：先頭(0)と末尾(path.length-1)を除外
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;

        let footprintType: GridCellKey | null = null;
        if (dx === 1 && dy === 0) footprintType = "FootRight";
        else if (dx === -1 && dy === 0) footprintType = "FootLeft";
        else if (dx === 0 && dy === 1) footprintType = "FootDown";
        else if (dx === 0 && dy === -1) footprintType = "FootUp";

        if (footprintType) {
          // Grid は [row][col]、Vector は {x: col, y: row}
          state.grid[curr.y][curr.x] = {
            type: footprintType,
            side: "neutral",
          };
        }
      }
    },

  },
});

export default gridSlice.reducer;
