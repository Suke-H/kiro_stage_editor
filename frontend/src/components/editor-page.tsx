import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { gridSlice } from '../store/slices/grid-slice';

import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';

const EditorPage: React.FC = () => {
  const dispatch = useDispatch();

  // エディタモード時に、プレイモードで実施したパネル配置をリセット
  useEffect(() => {
    dispatch(gridSlice.actions.reset());
  }, [dispatch]);

  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
      <div className="flex gap-4">
        <CellTypeSelector />
        <Grid />
      </div>
  
      <div className="flex gap-4">
        <PanelList />
        <NewPanelCreator />
      </div>
    </div>
  );
};

export default EditorPage;