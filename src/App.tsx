import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';

// セルの種類を定義
type CellType = 'empty' | 'wall' | 'start' | 'goal' | 'obstacle';

// セルの種類に対応するアイコンと色
const CELL_TYPES: Record<CellType, { label: string, color: string }> = {
  'empty': { label: '空白', color: 'bg-white' },
  'wall': { label: '壁', color: 'bg-gray-500' },
  'start': { label: '開始', color: 'bg-green-500' },
  'goal': { label: 'ゴール', color: 'bg-blue-500' },
  'obstacle': { label: '障害物', color: 'bg-red-500' }
};

const GridPuzzleStageEditor: React.FC = () => {
  const [grid, setGrid] = useState<CellType[][]>([
    ['empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty']
  ]);

  const [selectedCellType, setSelectedCellType] = useState<CellType>('wall');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // グリッドのサイズを変更
  const adjustGridSize = (rowDelta: number, colDelta: number) => {
    setGrid(prevGrid => {
      const newRows = prevGrid.length + rowDelta;
      const newCols = prevGrid[0].length + colDelta;

      if (newRows > 0 && newCols > 0) {
        // 行の追加/削除
        if (rowDelta > 0) {
          return [...prevGrid, ...Array(rowDelta).fill(Array(prevGrid[0].length).fill('empty'))];
        } else if (rowDelta < 0) {
          return prevGrid.slice(0, newRows);
        }

        // 列の追加/削除
        return prevGrid.map(row => {
          if (colDelta > 0) {
            return [...row, ...Array(colDelta).fill('empty')];
          } else if (colDelta < 0) {
            return row.slice(0, newCols);
          }
          return row;
        });
      }
      return prevGrid;
    });
  };

  // セルをクリックしてセルの種類を変更
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = selectedCellType;
    setGrid(newGrid);
  };

  // ステージをJSONでエクスポート
  const exportStage = () => {
    const stageData = {
      rows: grid.length,
      cols: grid[0].length,
      cells: grid
    };
    const jsonString = JSON.stringify(stageData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stage.json';
    link.click();
  };

  // JSONからステージをインポート
  const importStage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const stageData = JSON.parse(e.target?.result as string);
          setGrid(stageData.cells);
        } catch (error) {
          console.error('Invalid JSON file', error);
          alert('有効なJSONファイルを選択してください');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            <div className="flex gap-2 mb-4">
              <Button onClick={() => adjustGridSize(1, 0)}>行追加</Button>
              <Button onClick={() => adjustGridSize(-1, 0)}>行削除</Button>
              <Button onClick={() => adjustGridSize(0, 1)}>列追加</Button>
              <Button onClick={() => adjustGridSize(0, -1)}>列削除</Button>
            </div>
            
            <div className="grid" style={{ 
              gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
              gap: '4px'
            }}>
              {grid.map((row, rowIndex) => 
                row.map((cellType, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`h-10 w-10 border ${CELL_TYPES[cellType].color}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  />
                ))
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={exportStage} className="flex items-center gap-2">
                <Download size={16} /> JSONエクスポート
              </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".json" 
              onChange={importStage} 
              className="hidden" 
            />
            <Button 
              variant="outline" 
              onClick={triggerFileInput}
              className="flex items-center gap-2"
            >
              <Upload size={16} /> JSONインポート
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GridPuzzleStageEditor;