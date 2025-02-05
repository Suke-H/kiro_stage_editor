import { configureStore } from '@reduxjs/toolkit';
import cellTypeReducer from './slices/cell-type-slice';

export const store = configureStore({
  reducer: {
    cellType: cellTypeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;