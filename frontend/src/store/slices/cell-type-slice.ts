import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CellDefinitions } from "../../constants/cell-types";
import { CellTypeState } from "../../components/types";

const initialState: CellTypeState = {
  selectedCellType: "Black",
};

export const cellTypeSlice = createSlice({
  name: "cellType",
  initialState,
  reducers: {
    changeCellType: (state, action: PayloadAction<CellDefinitions>) => {
      state.selectedCellType = action.payload;
    },
  },
});

export const { changeCellType } = cellTypeSlice.actions;
export default cellTypeSlice.reducer;
