import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CopyPanel } from "@/types/panel";
import { CopyPanelListState } from "@/types/store/states";

const initialState: CopyPanelListState = {
  panels: [],
  removedPanels: [],
};

export const copyPanelListSlice = createSlice({
  name: "copy-panel-list",
  initialState,
  reducers: {
    /** URL などから読み込む */
    loadPanels: (state, action: PayloadAction<CopyPanel[]>) => {
      state.panels = action.payload;
    },

    /* Editor モード */
    createPanel: (state, action: PayloadAction<CopyPanel>) => {
      state.panels.push(action.payload);
    },
    removePanel: (state, action: PayloadAction<string>) => {
      state.panels = state.panels.filter(p => p.id !== action.payload);
    },

    /* Play モード */
    placePanel: (state, action: PayloadAction<CopyPanel>) => {
      const index = state.panels.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.removedPanels.push({ panel: action.payload, index });
        state.panels.splice(index, 1);
      }
    },
    undo: state => {
      const last = state.removedPanels.pop();
      if (last) state.panels.splice(last.index, 0, last.panel);
    },
    reset: state => {
      while (state.removedPanels.length) {
        const last = state.removedPanels.pop();
        if (last) state.panels.splice(last.index, 0, last.panel);
      }
    },
  },
});

export default copyPanelListSlice.reducer;
