import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import cellTypeReducer from './slices/cell-type-slice';
// import panelReducer from './slices/panel-slice';
import panelListReducer from './slices/panel-list-slice';
import panelPlacementReducer from './slices/panel-placement-slice';
import createPanelReducer from './slices/create-panel-slice';

import gridReducer from './slices/grid-slice';

export const store = configureStore({
  reducer: {
    cellType: cellTypeReducer,
    panelList: panelListReducer,
    panelPlacement: panelPlacementReducer,
    createPanel: createPanelReducer,
    grid: gridReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;