import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { studioModeInEditorSlice } from "@/store/slices/studio-mode-in-editor-slice";
import { RootState } from "@/store";
import { StudioModeInEditor } from "@/types/store";

import { CellTypeSelector } from "@/components/editor/cell-type-selector";
import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";
import { NewPanelCreator } from "@/components/editor/new-panel-creator";
import { FlagCreator } from "@/components/editor/flag-creator";

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
    // 履歴を初期化
    dispatch(gridSlice.actions.initHistory());
    dispatch(gridSlice.actions.initPhaseHistory());

    // 「Editor内スタジオモード」をEditorに変更
    dispatch(
      studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Editor)
    );
  }, [dispatch]);

  // 「Editor内スタジオモード」を監視して、Editorに変わった時、履歴をクリア
  useEffect(() => {
    if (studioModeInEditor === StudioModeInEditor.Editor) {
      // グリッド履歴を初期化
      dispatch(gridSlice.actions.initHistory());
      dispatch(gridSlice.actions.initPhaseHistory());
      // パネル配置リセット
      dispatch(panelListSlice.actions.reset());
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
    }
  }, [studioModeInEditor, dispatch]);

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-start">
      <div className="flex gap-4">
        <CellTypeSelector />
        <GridViewer />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <PanelList />
        <NewPanelCreator />
        <FlagCreator />
      </div>
    </div>
  );
};

export default EditorPage;
