import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelPlacementState, PanelPlacementModeType } from "../../components/types";

const initialState: PanelPlacementState = {
  panelPlacementMode: {
    panel: null,
    highlightedCell: null,
  },
  panelPlacementHistory: [],
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

    // 設置
    addToPlacementHistory: (
      state,
      action: PayloadAction<PanelPlacementModeType>
    ) => {
      state.panelPlacementHistory.push(action.payload);
    },
    resetPlacementHistory: (state) => {
      state.panelPlacementHistory = [];
    },
    undoPlacement: (state) => {
      if (state.panelPlacementHistory.length > 0) {
        state.panelPlacementHistory.pop();
      }
    },

  },
});

// export const { selectPanelForPlacement } = panelSlice.actions;
export default panelPlacementSlice.reducer;
