import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GridState, GridCell } from "../../components/types";

const initialState: GridState = {
    grid: [
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
        [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
    ],
    gridHistory: [],
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
    loadGrid: (state, action: PayloadAction<GridCell[][]>) => {
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
    }
  },
});

// export const { initGrid,  } = panelSlice.actions;
export default gridSlice.reducer;
