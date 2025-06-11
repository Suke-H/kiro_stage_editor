import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import studioModeReducer from "./slices/studio-mode-slice";
import studioModeInEditorReducer from "./slices/studio-mode-in-editor-slice";
import cellTypeReducer from "./slices/cell-type-slice";
import panelListReducer from "./slices/panel-list-slice";
import copyPanelListReducer from "./slices/copy-panel-list-slice";
import panelPlacementReducer from "./slices/panel-placement-slice";
import createPanelReducer from "./slices/create-panel-slice";
import gridReducer from "./slices/grid-slice";
import solutionReducer from "./slices/solution-slice";

export const store = configureStore({
  reducer: {
    studioMode: studioModeReducer,
    studioModeInEditor: studioModeInEditorReducer,
    cellType: cellTypeReducer,
    panelList: panelListReducer,
    copyPanelList: copyPanelListReducer,
    panelPlacement: panelPlacementReducer,
    createPanel: createPanelReducer,
    grid: gridReducer,
    solution: solutionReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
