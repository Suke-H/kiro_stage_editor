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
    },

    // パネル選択解除
    clearPanelSelection: (state) => {
      state.panelPlacementMode.panel = null;
      state.panelPlacementMode.highlightedCell = null;
    }
    
  },
});

export default panelPlacementSlice.reducer;
