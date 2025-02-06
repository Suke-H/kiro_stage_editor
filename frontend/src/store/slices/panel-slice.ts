import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelState, PanelPlacementModeType, Panel } from "../../components/types";

const initialState: PanelState = {
  newPanelGrid: 
    Array(3).fill(null).map(() => Array(3).fill('White')),
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

    // パネルグリッド
    initPanelGrid: (state) => {
      state.newPanelGrid = Array(3).fill(null).map(() => Array(3).fill('White'));
    },
    addToPanelGridRow: (state) => {
      state.newPanelGrid.push(Array(state.newPanelGrid[0].length).fill('White'));
    },
    addToPanelGridCol: (state) => {
      state.newPanelGrid = state.newPanelGrid.map((row) => [...row, 'White']);
    },
    removeFromPanelGridRow: (state) => {
      state.newPanelGrid.pop();
    },
    removeFromPanelGridCol: (state) => {
      state.newPanelGrid = state.newPanelGrid.map((row) => row.slice(0, row.length - 1));
    },
    clickToPanelGridCell: (state, action: PayloadAction<{ row: number; col: number }>) => {
      const { row, col } = action.payload;
      state.newPanelGrid[row][col] = state.newPanelGrid[row][col] === 'Black' ? 'White' : 'Black';
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

// export const { selectPanelForPlacement } = panelSlice.actions;
export default panelSlice.reducer;
