import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CreatePanelState } from "../../components/types";

const initialState: CreatePanelState = {
  newPanelGrid: Array(3)
    .fill(null)
    .map(() => Array(3).fill("White")),
};

export const createPanelSlice = createSlice({
  name: "create-panel",
  initialState,
  reducers: {
    // パネルグリッドの初期化
    initPanelGrid: (state) => {
      state.newPanelGrid = Array(3)
        .fill(null)
        .map(() => Array(3).fill("White"));
    },

    // パネルグリッドの行・列の追加・削除
    addToRow: (state) => {
      state.newPanelGrid.push(
        Array(state.newPanelGrid[0].length).fill("White")
      );
    },
    addToCol: (state) => {
      state.newPanelGrid = state.newPanelGrid.map((row) => [...row, "White"]);
    },
    removeFromRow: (state) => {
      state.newPanelGrid.pop();
    },
    removeFromCol: (state) => {
      state.newPanelGrid = state.newPanelGrid.map((row) =>
        row.slice(0, row.length - 1)
      );
    },

    // セル反転
    clickToCell: (
      state,
      action: PayloadAction<{ row: number; col: number }>
    ) => {
      const { row, col } = action.payload;
      state.newPanelGrid[row][col] =
        state.newPanelGrid[row][col] === "Black" ? "White" : "Black";
    },
  },
});

export default createPanelSlice.reducer;
