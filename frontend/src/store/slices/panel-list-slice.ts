import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PanelListState, Panel } from "../../components/types";

const initialState: PanelListState = {
  panels: [
    {
      id: "panel1",
      cells: [
        ["Black", "Black"],
        ["Black", "Black"],
      ],
    },
    {
      id: "panel2",
      cells: [
        ["Black", "White"],
        ["White", "Black"],
      ],
    },
  ],
};

export const panelListSlice = createSlice({
  name: "panel-list",
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
      state.panels = state.panels.filter(
        (panel) => panel.id !== action.payload
      );
    }

  },
});

// export const { selectPanelForPlacement } = panelSlice.actions;
export default panelListSlice.reducer;
