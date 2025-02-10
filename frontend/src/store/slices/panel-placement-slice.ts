import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PanelPlacementState,
  PanelPlacementModeType,
} from "../../components/types";

const initialState: PanelPlacementState = {
  panelPlacementMode: {
    panel: null,
    highlightedCell: null,
  },
};

export const panelPlacementSlice = createSlice({
  name: "panel",
  initialState,
  reducers: {
    
    // パネル選択
    selectPanelForPlacement: (
      state,
      action: PayloadAction<PanelPlacementModeType>
    ) => {
      state.panelPlacementMode.panel = action.payload.panel;
      state.panelPlacementMode.highlightedCell = action.payload.highlightedCell;
    }
    
  },
});

// export const { selectPanelForPlacement } = panelSlice.actions;
export default panelPlacementSlice.reducer;
