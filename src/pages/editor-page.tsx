import { useState } from 'react';
import { CellTypeSelector } from '@/components/editor/cell-type-selector';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';
import { CellType, Panel } from '@/components/types';

const GridPuzzleStageEditorPage: React.FC = () => {
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

  const adjustGridSize = (rowDelta: number, colDelta: number) => {
    setGrid((prevGrid) => {
      const newRows = prevGrid.length + rowDelta;
      const newCols = prevGrid[0].length + colDelta;

      if (newRows > 0 && newCols > 0) {
        if (rowDelta > 0) {
          return [...prevGrid, ...Array(rowDelta).fill(Array(newCols).fill('white'))];
        } else if (rowDelta < 0) {
          return prevGrid.slice(0, newRows).map((row) => row.slice(0, newCols));
        }

        return prevGrid.map((row) => {
          if (colDelta > 0) {
            return [...row, ...Array(colDelta).fill('white')];
          } else if (colDelta < 0) {
            return row.slice(0, newCols);
          }
          return row;
        });
      }
      return prevGrid;
    });
  };

  const adjustNewPanelGridSize = (rowDelta: number, colDelta: number) => {
    setNewPanelGrid((prevGrid) => {
      const newRows = prevGrid.length + rowDelta;
      const newCols = prevGrid[0].length + colDelta;

      if (newRows > 0 && newCols > 0) {
        if (rowDelta > 0) {
          return [...prevGrid, ...Array(rowDelta).fill(Array(newCols).fill('white'))];
        } else if (rowDelta < 0) {
          return prevGrid.slice(0, newRows).map((row) => row.slice(0, newCols));
        }

        return prevGrid.map((row) => {
          if (colDelta > 0) {
            return [...row, ...Array(colDelta).fill('white')];
          } else if (colDelta < 0) {
            return row.slice(0, newCols);
          }
          return row;
        });
      }
      return prevGrid;
    });
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = selectedCellType;
    setGrid(newGrid);
  };

  const handleNewPanelCellClick = (rowIndex: number, colIndex: number) => {
    const newPanelGridCopy = newPanelGrid.map((row) => [...row]);
    newPanelGridCopy[rowIndex][colIndex] = 'black';
    setNewPanelGrid(newPanelGridCopy);
  };

  const addPanel = () => {
    const nonEmptyCells = newPanelGrid.some((row) => row.some((cell) => cell === 'black'));
    if (nonEmptyCells) {
      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        cells: newPanelGrid,
      };
      setPanels([...panels, newPanel]);
      setNewPanelGrid(Array(3).fill(null).map(() => Array(3).fill('white')));
    }
  };
  
  const removePanel = (panelId: string) => {
    setPanels(panels.filter(panel => panel.id !== panelId));
  };
  
  const handlePanelDragStart = (panel: Panel) => {
    setDraggingPanel(panel);
  };
  
  const handlePanelDragEnd = () => {
    setDraggingPanel(null);
  };
  
  const handleGridDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleGridDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggingPanel) return;
  
    const rect = e.currentTarget.getBoundingClientRect();
    const cellWidth = rect.width / grid[0].length;
    const cellHeight = rect.height / grid.length;
  
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    const rowIndex = Math.floor(y / cellHeight);
    const colIndex = Math.floor(x / cellWidth);
  
    const panelRows = draggingPanel.cells.length;
    const panelCols = draggingPanel.cells[0].length;
  
    const canPlacePanel =
      rowIndex + panelRows <= grid.length &&
      colIndex + panelCols <= grid[0].length;
  
    if (canPlacePanel) {
      const updatedGrid = grid.map((row) => [...row]);
  
      for (let i = 0; i < panelRows; i++) {
        for (let j = 0; j < panelCols; j++) {
          if (draggingPanel.cells[i][j] === 'black') {
            const currentCell = updatedGrid[rowIndex + i][colIndex + j];
            updatedGrid[rowIndex + i][colIndex + j] =
              currentCell === 'black' ? 'white' : 'black';
          }
        }
      }
  
      setGrid(updatedGrid);
    }
  
    setDraggingPanel(null);
  };
  
  const exportStage = () => {
    const stageData = {
      rows: grid.length,
      cols: grid[0].length,
      cells: grid,
      panels: panels,
    };
    const jsonString = JSON.stringify(stageData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stage.json';
    link.click();
  };
  
  const importStage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const stageData = JSON.parse(e.target?.result as string);
        setGrid(stageData.cells);
        setPanels(stageData.panels || []);
      };
      reader.readAsText(file);
    }
  };
  
  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="flex gap-4">
        <CellTypeSelector 
          selectedCellType={selectedCellType} 
          onCellTypeChange={setSelectedCellType} 
        />
        <Grid 
          grid={grid}
          onCellClick={handleCellClick}
          onGridSizeChange={adjustGridSize}
          onExport={exportStage}
          onImport={importStage}
          onDragOver={handleGridDragOver}
          onDrop={handleGridDrop}
        />
      </div>
  
      <div className="flex gap-4">
        <PanelList 
          panels={panels}
          onRemovePanel={removePanel}
          onPanelDragStart={handlePanelDragStart}
          onPanelDragEnd={handlePanelDragEnd}
        />
        <NewPanelCreator 
          newPanelGrid={newPanelGrid}
          onCellClick={handleNewPanelCellClick}
          onGridSizeChange={adjustNewPanelGridSize}
          onAddPanel={addPanel}
        />
      </div>
    </div>
  );
  };
  
  export default GridPuzzleStageEditorPage;