import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import cellTypeReducer from './slices/cell-type-slice';
import panelReducer from './slices/panel-slice';
import gridReducer from './slices/grid-slice';

export const store = configureStore({
  reducer: {
    cellType: cellTypeReducer,
    panel: panelReducer,
    grid: gridReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;