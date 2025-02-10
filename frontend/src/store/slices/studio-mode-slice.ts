// studio-mode-slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudioMode, StudioModeState } from '../../components/types';

const initialState: StudioModeState = {
  studioMode: StudioMode.Editor,
};

export const studioModeSlice = createSlice({
  name: 'studioMode',
  initialState,
  reducers: {
    switchMode(state, action: PayloadAction<StudioMode>) {
      state.studioMode = action.payload;
    },
  },
});

// reducer 部分はデフォルトエクスポートとしてエクスポートしてもよい
export default studioModeSlice.reducer;
