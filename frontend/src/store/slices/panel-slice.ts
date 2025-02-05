import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelState, PanelPlacementModeType } from "../../components/types";

const initialState: PanelState = {
  panelPlacementMode: {
    panel: null,
    highlightedCell: null,
  },
};

export const panelSlice = createSlice({
  name: "panel",
  initialState,
  reducers: {
    selectPanelForPlacement: (
      state,
      action: PayloadAction<PanelPlacementModeType>
    ) => {
      state.panelPlacementMode.panel = action.payload.panel;
      state.panelPlacementMode.highlightedCell = action.payload.highlightedCell;
    },
  },
});

export const { selectPanelForPlacement } = panelSlice.actions;
export default panelSlice.reducer;
