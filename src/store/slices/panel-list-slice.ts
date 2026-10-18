import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Panel } from "@/types/panel"
import { PanelListState } from "@/types/store/states";
import {
  collectPlacedFlagInInventory,
  placePanelInInventory,
  resetAllPanelInventory,
  resetPanelInventory,
  undoPanelPlacementInInventory,
} from "@/logic/panel-inventory";

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
      state.removedPanels = [];
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
    placePanel: (state, action: PayloadAction<Panel>) => placePanelInInventory(state, action.payload),

    // 盤面上の旗を取得済みにする
    collectPlacedFlag: (state) => collectPlacedFlagInInventory(state),

    // 設置を元に戻す（undo）
    undo: (state) => undoPanelPlacementInInventory(state),

    // 設置履歴をリセット（reset）
    reset: (state) => resetPanelInventory(state),

    // 取得済みの旗を含む全パネルを元に戻す
    resetAll: (state) => resetAllPanelInventory(state),

  },
});

export default panelListSlice.reducer;
