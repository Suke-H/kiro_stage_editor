import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CellDefinitionKey } from "@/types/cell"
import { CellTypeState } from "@/types/store/states";

const initialState: CellTypeState = {
  selectedCellType: "Normal",
};

export const cellTypeSlice = createSlice({
  name: "cellType",
  initialState,
  reducers: {
    changeCellType: (state, action: PayloadAction<CellDefinitionKey>) => {
      state.selectedCellType = action.payload;
    },
  },
});

export default cellTypeSlice.reducer;
