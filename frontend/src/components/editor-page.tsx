import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { gridSlice } from '../store/slices/grid-slice';
import { panelListSlice } from '../store/slices/panel-list-slice';
import { studioModeInEditorSlice } from "../store/slices/studio-mode-in-editor-slice";
import { RootState } from '../store';
import { StudioModeInEditor } from "./types";

import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';

const EditorPage: React.FC = () => {
  const dispatch = useDispatch();
  // Editor内スタジオモードを監視
  const studioModeInEditor = useSelector(
    (state: RootState) => state.studioModeInEditor.studioModeInEditor
  );

  // Play->Editor移行時に、Playモード時のパネル配置をリセット
  useEffect(() => {
    dispatch(gridSlice.actions.reset());
    dispatch(panelListSlice.actions.reset());
    
    // 最後に履歴を完全クリア
    dispatch(gridSlice.actions.clearHistory());

    // 「Editor内スタジオモード」をEditorに変更
    dispatch(studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Editor));
  }, [dispatch]);

  // 「Editor内スタジオモード」を監視して、Editorに変わった時、履歴をクリア
  useEffect(() => {
    if (studioModeInEditor === StudioModeInEditor.Editor) {
      // グリッド状態を元に戻すことなく、履歴クリアする
      dispatch(gridSlice.actions.clearHistory());
      // パネル配置はリセット
      dispatch(panelListSlice.actions.reset());
    }
  }, [studioModeInEditor, dispatch]);

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-start">
      <div className="flex gap-4">
        <CellTypeSelector />
        <Grid />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <PanelList />
        <NewPanelCreator />
      </div>
    </div>
  );
};

export default EditorPage;