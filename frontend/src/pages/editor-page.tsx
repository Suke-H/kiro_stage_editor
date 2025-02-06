import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { gridSlice } from '../store/slices/grid-slice';
import { panelListSlice } from '../store/slices/panel-list-slice';

import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { decodeStageFromUrl } from '../utils/url';

const EditorPage: React.FC = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cells = params.get('cells');
    const panels = params.get('panels');
    
    if (cells && panels) {
      const stageData = `cells=${cells}&panels=${panels}`;
      const parsedData = decodeStageFromUrl(stageData);
      dispatch(gridSlice.actions.loadGrid(parsedData.cells));
      dispatch(panelListSlice.actions.loadPanels(parsedData.panels));
    }
  }, []);

  // FastAPIの疎通確認
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('/api/health'); // FastAPIのエンドポイント
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API疎通確認成功:', data);
      } catch (error) {
        console.error('API疎通確認エラー:', error);
      }
    };

    checkApiConnection();
  }, []);

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