import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Plus, Trash2, Move, PlusCircle, MinusCircle } from 'lucide-react';

// セルの種類を定義
type CellType = 'white' | 'black' | 'start' | 'goal' | 'obstacle';

type Panel = {
  id: string;
  cells: CellType[][];
};

const CELL_TYPES: Record<CellType, { label: string, color: string }> = {
  'white': { label: '白', color: 'bg-white' },
  'black': { label: '黒', color: 'bg-black' },
  'start': { label: '開始', color: 'bg-green-500' },
  'goal': { label: 'ゴール', color: 'bg-blue-500' },
  'obstacle': { label: '障害物', color: 'bg-red-500' },
};

const GridPuzzleStageEditor: React.FC = () => {
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
        {/* セル種類選択ビュー */}
        <Card className="w-64">
          <CardHeader>
            <CardTitle>セル種類</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {(Object.keys(CELL_TYPES) as CellType[]).map((type) => (
              <Button
                key={type}
                variant={selectedCellType === type ? 'default' : 'outline'}
                className={`${CELL_TYPES[type].color} text-white`}
                onClick={() => setSelectedCellType(type)}
              >
                {CELL_TYPES[type].label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* グリッドビュー */}
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
      </div>

      {/* パネル管理セクション */}
      <div className="flex gap-4">
        {/* パネルビュー */}
        <Card className="w-64">
          <CardHeader>
            <CardTitle>パネル</CardTitle>
          </CardHeader>
          <CardContent>
            {panels.map((panel) => (
              <div
                key={panel.id}
                className="flex items-center gap-2 mb-2"
                draggable
                onDragStart={() => handlePanelDragStart(panel)}
                onDragEnd={handlePanelDragEnd}
              >
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${panel.cells[0].length}, 40px)`,
                    maxWidth: '160px',
                  }}
                >
                  {panel.cells.map((row, rowIndex) =>
                    row.map((cellType, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`h-10 w-10 border ${
                          cellType === 'black' ? 'bg-gray-500' : 'bg-white'
                        }`}
                      />
                    )),
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePanel(panel.id)}>
                  <Trash2 size={16} />
                </Button>
                <Move size={16} className="text-gray-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* パネル追加ビュー */}
        <Card className="w-64">
          <CardHeader>
            <CardTitle>パネル追加</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={() => adjustNewPanelGridSize(1, 0)} className="flex items-center gap-2">
                <PlusCircle size={16} /> 行追加
              </Button>
              <Button onClick={() => adjustNewPanelGridSize(-1, 0)} className="flex items-center gap-2">
                <MinusCircle size={16} /> 行削除
              </Button>
              <Button onClick={() => adjustNewPanelGridSize(0, 1)} className="flex items-center gap-2">
                <PlusCircle size={16} /> 列追加
              </Button>
              <Button onClick={() => adjustNewPanelGridSize(0, -1)} className="flex items-center gap-2">
                <MinusCircle size={16} /> 列削除
              </Button>
            </div>
            <div
              className="grid mb-4"
              style={{
                gridTemplateColumns: `repeat(${newPanelGrid[0].length}, 40px)`,
                gap: '4px',
              }}
            >
              {newPanelGrid.map((row, rowIndex) =>
                row.map((cellType, colIndex) => (
                  <div
                    key={`new-${rowIndex}-${colIndex}`}
                    className={`h-10 w-10 border ${
                      cellType === 'black' ? 'bg-gray-500' : 'bg-white'
                    }`}
                    onClick={() => handleNewPanelCellClick(rowIndex, colIndex)}
                  />
                )),
              )}
            </div>
            <Button onClick={addPanel} className="w-full flex items-center gap-2">
              <Plus size={16} /> パネル追加
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GridPuzzleStageEditor;
