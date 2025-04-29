import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Panel } from "@/types/panel"
import { PanelListState } from "@/types/store/states";

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

  removedPanels: [],
};

export const panelListSlice = createSlice({
  name: "panel-list",
  initialState,
  reducers: {
    // URLから読み込み
    loadPanels: (state, action: PayloadAction<Panel[]>) => {
      state.panels = action.payload;
    },

    /* Editorモード */
    // パネル作成・削除
    createPanel: (state, action: PayloadAction<Panel>) => {
    state.panels.push(action.payload);
    },
    removePanel: (state, action: PayloadAction<string>) => {
      state.panels = state.panels.filter(
        (panel) => panel.id !== action.payload
      );
    },

    /* Playモード */
    // パネル選択（設置）
    placePanel: (state, action: PayloadAction<Panel>) => {
      const index = state.panels.findIndex((panel) => panel.id === action.payload.id);
      
      if (index !== -1 && action.payload) {
        state.removedPanels.push({ panel: action.payload, index }); // 履歴に保存
        state.panels.splice(index, 1);                              // パネルを削除       
      }
    },

    // 設置を元に戻す（undo）
    undo: (state) => {
      const lastRemoved = state.removedPanels.pop();
      if (lastRemoved) {
        state.panels.splice(lastRemoved.index, 0, lastRemoved.panel);
      }
    },

    // 設置履歴をリセット（reset）
    reset: (state) => {
      while (state.removedPanels.length > 0) {
        const lastRemoved = state.removedPanels.pop();
        if (lastRemoved) {
          state.panels.splice(lastRemoved.index, 0, lastRemoved.panel);
        }
      }
    },

  },
});

export default panelListSlice.reducer;
