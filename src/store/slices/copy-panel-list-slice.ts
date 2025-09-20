import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CopyPanel } from "@/types/panel";
import { CopyPanelListState } from "@/types/store/states";

const initialState: CopyPanelListState = {
  copyPanels: [],
  pastedPanels: [],
  lastOperationType: null,
};

export const copyPanelListSlice = createSlice({
  name: "copy-panel-list",
  initialState,
  reducers: {
    /** URL などから読み込む */
    loadPanels: (state, action: PayloadAction<CopyPanel[]>) => {
      state.copyPanels = action.payload;
    },

    /* Editor モード */
    createPanel: (state, action: PayloadAction<CopyPanel>) => {
      state.copyPanels.push(action.payload);
      state.lastOperationType = 'cut';
    },
    removePanel: (state, action: PayloadAction<string>) => {
      state.copyPanels = state.copyPanels.filter(p => p.id !== action.payload);
    },

    /* Play モード */
    placePanel: (state, action: PayloadAction<CopyPanel>) => {
      const index = state.copyPanels.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.pastedPanels.push(action.payload);
        state.copyPanels.splice(index, 1);
        state.lastOperationType = 'paste';
      }
    },
    undo: state => {
      if (state.lastOperationType === 'paste') {
        state.pastedPanels.pop();
      } else if (state.lastOperationType === 'cut') {
        state.copyPanels.pop();
      }
      state.lastOperationType = null;
    },
    reset: state => {
      state.copyPanels = [];
      state.pastedPanels = [];
      state.lastOperationType = null;
    },
  },
});

export default copyPanelListSlice.reducer;
