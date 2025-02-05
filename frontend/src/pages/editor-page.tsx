import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';

import { store } from '../store';
import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { CellType, GridCell, Panel, PanelPlacementHistoryType } from '@/components/types';
import { decodeStageFromUrl } from '../utils/url';

const EditorPage: React.FC = () => {

  const [grid, setGrid] = useState<GridCell[][]>([
    [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
    [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
    [{ type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }, { type: 'Normal', side: 'front' }],
  ]);

  const [panels, setPanels] = useState<Panel[]>([
    {
      id: 'panel1',
      cells: [
        ['Black', 'Black'],
        ['Black', 'Black'],
      ],
    },
    {
      id: 'panel2',
      cells: [
        ['Black', 'White'],
        ['White', 'Black'],
      ],
    },
  ]);

  const [newPanelGrid, setNewPanelGrid] = useState<CellType[][]>(() =>
    Array(3).fill(null).map(() => Array(3).fill('White')),
  );

  // const [panelPlacementMode, setPanelPlacementMode] = useState<PanelPlacementModeType>({
  //   panel: null,
  //   highlightedCell: null,
  // });

  const [gridHistory, setGridHistory] = useState<GridCell[][][]>([grid]);
  const [panelPlacementHistory, setPanelPlacementHistory] = useState<PanelPlacementHistoryType>([]);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const cells = params.get('cells');
    const panels = params.get('panels');
    
    if (cells && panels) {
      const stageData = `cells=${cells}&panels=${panels}`;
      const parsedData = decodeStageFromUrl(stageData);
      setGrid(parsedData.cells);
      setPanels(parsedData.panels);
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
    <Provider store={store}>
      <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
        <div className="flex gap-4">
          <CellTypeSelector 
          />
          <Grid 
            grid={grid} 
            setGrid={setGrid} 
            setGridHistory={setGridHistory} 
            panels={panels} 
            setPanels={setPanels} 
            // panelPlacementMode={panelPlacementMode} 
            // setPanelPlacementMode={setPanelPlacementMode} 
            setPanelPlacementHistory={setPanelPlacementHistory}
          />
        </div>
    
        <div className="flex gap-4">
          <PanelList 
            panels={panels}
            setPanels={setPanels}
            // panelPlacementMode={panelPlacementMode}
            // setPanelPlacementMode={setPanelPlacementMode}
            panelPlacementHistory={panelPlacementHistory}
            setPanelPlacementHistory={setPanelPlacementHistory}
            setGrid={setGrid}
            gridHistory={gridHistory}
            setGridHistory={setGridHistory}
          />
          <NewPanelCreator 
            newPanelGrid={newPanelGrid}
            setNewPanelGrid={setNewPanelGrid}
            panels={panels}
            setPanels={setPanels}
          />
        </div>
      </div>
    </Provider>
  );
  };
  
  export default EditorPage;