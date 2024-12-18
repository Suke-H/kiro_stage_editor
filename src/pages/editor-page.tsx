import { useState } from 'react';
import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { CellType, Panel, PanelPlacementModeType, PanelPlacementHistoryType } from '@/components/types';

const EditorPage: React.FC = () => {

  const [grid, setGrid] = useState<CellType[][]>([
    ['white', 'white', 'white'],
    ['white', 'white', 'white'],
    ['white', 'white', 'white'],
  ]);

  const [selectedCellType, setSelectedCellType] = useState<CellType>('black');
  const [panels, setPanels] = useState<Panel[]>([
    {
      id: 'panel1',
      cells: [
        ['black', 'black'],
        ['black', 'black'],
      ],
    },
    {
      id: 'panel2',
      cells: [
        ['black', 'white'],
        ['white', 'black'],
      ],
    },
  ]);

  const [newPanelGrid, setNewPanelGrid] = useState<CellType[][]>(() =>
    Array(3).fill(null).map(() => Array(3).fill('white')),
  );

  const [panelPlacementMode, setPanelPlacementMode] = useState<PanelPlacementModeType>({
    panel: null,
    highlightedCell: null,
  });

  const [gridHistory, setGridHistory] = useState<CellType[][][]>([grid]);
  const [panelPlacementHistory, setPanelPlacementHistory] = useState<PanelPlacementHistoryType[]>([]);

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