import { configureStore } from '@reduxjs/toolkit';
import cellTypeReducer from './slices/cell-type-slice';
import panelReducer from './slices/panel-slice';

export const store = configureStore({
  reducer: {
    cellType: cellTypeReducer,
    panel: panelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;