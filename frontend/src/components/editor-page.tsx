import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { gridSlice } from '../store/slices/grid-slice';
import { panelListSlice } from '../store/slices/panel-list-slice';

import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';

const EditorPage: React.FC = () => {
  const dispatch = useDispatch();

  // Play->Editor移行時に、Playモード時のパネル配置をリセット
  useEffect(() => {
    dispatch(gridSlice.actions.reset());
    dispatch(panelListSlice.actions.reset());
    
    // 最後に履歴を完全クリア
    dispatch(gridSlice.actions.clearHistory());
  }, [dispatch]);

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