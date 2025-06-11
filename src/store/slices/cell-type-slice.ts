import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GridCellKey } from "@/types/grid";
import { CellTypeState } from "@/types/store/states";

const initialState: CellTypeState = {
  selectedCellType: "Normal",
};

export const cellTypeSlice = createSlice({
  name: "cellType",
  initialState,
  reducers: {
    changeCellType: (state, action: PayloadAction<GridCellKey>) => {
      state.selectedCellType = action.payload;
    },
  },
});

export default cellTypeSlice.reducer;
