import { useState, useEffect } from 'react';
import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { CellType, Panel, PanelPlacementModeType, PanelPlacementHistoryType } from '@/components/types';
import { decodeStageFromUrl } from '../utils/url';

const EditorPage: React.FC = () => {

  const [grid, setGrid] = useState<CellType[][]>([
    ['White', 'White', 'White'],
    ['White', 'White', 'White'],
    ['White', 'White', 'White'],
  ]);

  const [selectedCellType, setSelectedCellType] = useState<CellType>('Black');
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

  const [panelPlacementMode, setPanelPlacementMode] = useState<PanelPlacementModeType>({
    panel: null,
    highlightedCell: null,
  });

  const [gridHistory, setGridHistory] = useState<CellType[][][]>([grid]);
  const [panelPlacementHistory, setPanelPlacementHistory] = useState<PanelPlacementHistoryType[]>([]);

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
    <div className="flex flex-col p-4 gap-4">
      <div className="flex gap-4">
        <CellTypeSelector 
          selectedCellType={selectedCellType} 
          onCellTypeChange={setSelectedCellType} 
        />
        <Grid 
          grid={grid} 
          setGrid={setGrid} 
          setGridHistory={setGridHistory} 
          selectedCellType={selectedCellType} 
          panels={panels} 
          setPanels={setPanels} 
          panelPlacementMode={panelPlacementMode} 
          setPanelPlacementMode={setPanelPlacementMode} 
          setPanelPlacementHistory={setPanelPlacementHistory}
        />
      </div>
  
      <div className="flex gap-4">
        <PanelList 
          panels={panels}
          setPanels={setPanels}
          panelPlacementMode={panelPlacementMode}
          setPanelPlacementMode={setPanelPlacementMode}
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
  );
  };
  
  export default EditorPage;