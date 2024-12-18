import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Download, Upload } from 'lucide-react';
import { CellType, Panel } from '../types';
import { CELL_TYPES } from '../../constants/cell-types';

interface GridProps {
  grid: CellType[][];
  setGrid: React.Dispatch<React.SetStateAction<CellType[][]>>;
  selectedCellType: CellType;
  panels: Panel[];
  setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  draggingPanel: Panel | null;
  setDraggingPanel: React.Dispatch<React.SetStateAction<Panel | null>>;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  setGrid,
  selectedCellType,
  panels,
  setPanels,
  draggingPanel,
  setDraggingPanel,
}) => {

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

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = selectedCellType;
    setGrid(newGrid);
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
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle>ステージエディター</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${grid[0].length}, 40px)`,
            gap: '4px',
          }}
          onDragOver={handleGridDragOver}
          onDrop={handleGridDrop}
        >
          {grid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${CELL_TYPES[cellType].color}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              />
            )),
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => adjustGridSize(1, 0)} className="flex items-center gap-2">
            <PlusCircle size={16} /> 行追加
          </Button>
          <Button onClick={() => adjustGridSize(-1, 0)} className="flex items-center gap-2">
            <MinusCircle size={16} /> 行削除
          </Button>
          <Button onClick={() => adjustGridSize(0, 1)} className="flex items-center gap-2">
            <PlusCircle size={16} /> 列追加
          </Button>
          <Button onClick={() => adjustGridSize(0, -1)} className="flex items-center gap-2">
            <MinusCircle size={16} /> 列削除
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={exportStage} className="flex items-center gap-2">
            <Download size={16} /> JSONエクスポート
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={importStage}
            className="hidden"
            id="jsonImport"
          />
          <label htmlFor="jsonImport" className="cursor-pointer">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload size={16} /> JSONインポート
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};