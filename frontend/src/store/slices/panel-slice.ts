import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelState, PanelPlacementModeType, Panel } from "../../components/types";

const initialState: PanelState = {
  panels: [
    {
      id: 'panel1',
      cells: [
        ['Black', 'Black'],
        ['Black', 'Black'],
      ],
    },
    {
      id: 'panel2',
      cells: [
        ['Black', 'White'],
        ['White', 'Black'],
      ],
    },
  ],
  panelPlacementMode: {
    panel: null,
    highlightedCell: null,
  },
  panelPlacementHistory: [],
};

export const panelSlice = createSlice({
  name: "panel",
  initialState,
  reducers: {
    // URLから読み込み
    loadPanels: (state, action: PayloadAction<Panel[]>) => {
      state.panels = action.payload;
    },

    // パネル作成・削除
    createPanel: (state, action: PayloadAction<Panel>) => {
      state.panels.push(action.payload);
    },
    removePanel: (state, action: PayloadAction<string>) => {
      state.panels = state.panels.filter((panel) => panel.id !== action.payload);
    },

    // パネル選択
    selectPanelForPlacement: (state, action: PayloadAction<PanelPlacementModeType>) => {
      state.panelPlacementMode.panel = action.payload.panel;
      state.panelPlacementMode.highlightedCell = action.payload.highlightedCell;
    },

    // 設置
    addToPlacementHistory: (state, action: PayloadAction<PanelPlacementModeType>) => {
      state.panelPlacementHistory.push(action.payload);
    },
    resetPlacementHistory: (state) => {
      state.panelPlacementHistory = [];
    },
    undoPlacement: (state) => {
      if (state.panelPlacementHistory.length > 0) {
        state.panelPlacementHistory.pop();
      }
    }

    // 
  },
});

export const { selectPanelForPlacement } = panelSlice.actions;
export default panelSlice.reducer;
