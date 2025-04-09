// studio-mode-slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudioModeInEditor, StudioModeStateInEditor } from '../../components/types';

const initialState: StudioModeStateInEditor = {
  studioModeInEditor: StudioModeInEditor.Editor,
};

export const studioModeInEditorSlice = createSlice({
  name: 'studioModeInEditor',
  initialState,
  reducers: {
    switchMode(state, action: PayloadAction<StudioModeInEditor>) {
      state.studioModeInEditor = action.payload;
    },
  },
});

export default studioModeInEditorSlice.reducer;
