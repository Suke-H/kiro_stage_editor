import { useState } from 'react';
import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { CellType, Panel } from '@/components/types';

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

  const [draggingPanel, setDraggingPanel] = useState<Panel | null>(null);

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
          selectedCellType={selectedCellType}
          panels={panels}
          setPanels={setPanels}
          draggingPanel={draggingPanel}
          setDraggingPanel={setDraggingPanel}
        />
      </div>
  
      <div className="flex gap-4">
        <PanelList 
          panels={panels}
          setPanels={setPanels}
          setDraggingPanel={setDraggingPanel}
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