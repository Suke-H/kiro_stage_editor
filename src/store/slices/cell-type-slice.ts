import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GridCellKey, GRID_CELL_TYPES } from "@/types/grid";
import { CellTypeState } from "@/types/store/states";

const initialState: CellTypeState = {
  selectedCellType: "Normal",
  selectedSide: GRID_CELL_TYPES["Normal"].defaultSide,
};

export const cellTypeSlice = createSlice({
  name: "cellType",
  initialState,
  reducers: {
    changeCellType: (state, action: PayloadAction<{ cellType: GridCellKey; side: "neutral" | "front" | "back" }>) => {
      state.selectedCellType = action.payload.cellType;
      state.selectedSide = action.payload.side;
    },
  },
});

export default cellTypeSlice.reducer;
