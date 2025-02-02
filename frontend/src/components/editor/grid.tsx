import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
// import { PlusCircle, MinusCircle, Download, Upload, Link } from 'lucide-react';
import { Download, Upload, Link } from 'lucide-react';
// import { IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { GridCell, Panel, PanelPlacementModeType, PanelPlacementHistoryType , CellDefinitions} from '../types';
import { CELL_DEFINITIONS, CellSideInfo } from '../../constants/cell-types';
import { exportStageToYaml, importStageFromYaml } from '../../utils/yaml';
import { shareStageUrl } from '../../utils/url';

interface GridProps {
  grid: GridCell[][];
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>;
  setGridHistory: React.Dispatch<React.SetStateAction<GridCell[][][]>>;
  selectedCellType: CellDefinitions;
  panels: Panel[];
  setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  panelPlacementMode: PanelPlacementModeType;
  setPanelPlacementMode: React.Dispatch<React.SetStateAction<PanelPlacementModeType>>;
  setPanelPlacementHistory: React.Dispatch<React.SetStateAction<PanelPlacementHistoryType[]>>;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  setGrid,
  setGridHistory,
  selectedCellType,
  panels,
  setPanels,
  panelPlacementMode,
  setPanelPlacementMode,
  setPanelPlacementHistory,
}) => {

  const adjustGridSize = (rowDelta: number, colDelta: number, addToStart = false) => {
    setGrid((prevGrid) => {
      const newRows = prevGrid.length + rowDelta;
      const newCols = prevGrid[0].length + colDelta;
  
      if (newRows > 0 && newCols > 0) {
        const createEmptyCell = (): GridCell => ({
          type: 'Normal',
          side: 'front',
        });
  
        let updatedGrid = [...prevGrid];
  
        // 行の追加・削除
        if (rowDelta > 0) {
          const newRow = Array(newCols).fill(null).map(() => createEmptyCell());
          updatedGrid = addToStart 
            ? [...Array(rowDelta).fill(null).map(() => newRow.map(cell => ({ ...cell }))), ...updatedGrid]
            : [...updatedGrid, ...Array(rowDelta).fill(null).map(() => newRow.map(cell => ({ ...cell })))];
        } else if (rowDelta < 0) {
          updatedGrid = addToStart ? updatedGrid.slice(-newRows) : updatedGrid.slice(0, newRows);
        }
  
        // 列の追加・削除
        updatedGrid = updatedGrid.map(row => {
          if (colDelta > 0) {
            const newCells = Array(colDelta).fill(null).map(() => createEmptyCell());
            return addToStart ? [...newCells, ...row] : [...row, ...newCells];
          } else if (colDelta < 0) {
            return addToStart ? row.slice(-newCols) : row.slice(0, newCols);
          }
          return row;
        });
  
        return updatedGrid;
      }
      return prevGrid;
    });
  };
  

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    // セル選択モード
    if (!panelPlacementMode.panel) {
      const newGrid = [...grid];
      
      const cellDef = CELL_DEFINITIONS[selectedCellType];

      // セル選択がFlipの場合：sideを反転
      if (selectedCellType === 'Flip') {
        const targetCell = newGrid[rowIndex][colIndex];
        if (targetCell.type === 'Empty') return;

        if (targetCell.side === 'front') {
          newGrid[rowIndex][colIndex] = { ...targetCell, side: 'back' };
        } else if (targetCell.side === 'back') {
          newGrid[rowIndex][colIndex] = { ...targetCell, side: 'front' };
        }
      }

      else {
        // 基本はfront（表）で設置する。neutralのみの場合はneutral
        const side = 'neutral' in cellDef ? 'neutral' : 'front';
        newGrid[rowIndex][colIndex] = { type: selectedCellType, side };
      }

      setGrid(newGrid);
      setGridHistory((prev) => [...prev, newGrid]);
      return;
      
    }
  
    // パネル配置モード
    const placingPanel = panelPlacementMode.panel;
  
    if (canPlacePanelAtLocation(grid, rowIndex, colIndex, placingPanel)) {
      const updatedGrid = grid.map((row) => [...row]);
  
      const panelRows = placingPanel.cells.length;
      const panelCols = placingPanel.cells[0].length;
  
      for (let i = 0; i < panelRows; i++) {
        for (let j = 0; j < panelCols; j++) {
          if (placingPanel.cells[i][j] === 'Black') {
            const targetCell = updatedGrid[rowIndex + i][colIndex + j];
            
            // Emptyには置かない
            if (targetCell.type === 'Empty') continue;
  
            // セルの状態を切り替える
            if (targetCell.side === 'front') {
              updatedGrid[rowIndex + i][colIndex + j] = { ...targetCell, side: 'back' };
            } else if (targetCell.side === 'back') {
              updatedGrid[rowIndex + i][colIndex + j] = { ...targetCell, side: 'front' };
            }
            // neutralの場合は変更しない
          }
        }
      }
  
      setGridHistory((prev) => [...prev, updatedGrid]);
      setPanelPlacementHistory((prev) => [...prev, panelPlacementMode]);
      setGrid(updatedGrid);
    }
  
    setPanelPlacementMode({
      panel: null,
      highlightedCell: null,
    });
  };
  
  const renderGridCell = (cell: GridCell, rowIndex: number, colIndex: number) => {
    const cellDef = CELL_DEFINITIONS[cell.type];
    
    // セルの状態に応じた情報を取得
    const sideInfo: CellSideInfo | undefined = cellDef[cell.side];

    if (!sideInfo) {
      console.error(`No valid sideInfo found for cell type: ${cell.type}`);
      return null; // またはデフォルトの要素を返す
    }

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`h-10 w-10 flex items-center justify-center ${cell.type === 'Empty' ? '' : 'border'}`}
        onClick={() => handleGridCellClick(rowIndex, colIndex)}
      >
        {cell.type !== 'Empty' && (
          <img
            src={`/cells/${sideInfo.picture}`}
            alt={`${cellDef.label} (${cell.side})`}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    );
  };

  const canPlacePanelAtLocation = (
    grid: GridCell[][],
    rowIndex: number,
    colIndex: number,
    panel: Panel
  ): boolean => {
    const panelRows = panel.cells.length;
    const panelCols = panel.cells[0].length;
  
    // グリッド範囲内に収まるか
    if (rowIndex + panelRows > grid.length || colIndex + panelCols > grid[0].length) {
      return false;
    }
  
    // パネルを配置するセルがすべて適切であるかチェック
    for (let i = 0; i < panelRows; i++) {
      for (let j = 0; j < panelCols; j++) {
        const panelCell = panel.cells[i][j];
        // パネルセルが黒の場合のみ設置判定
        if (panelCell === 'Black') {
          const targetCell = grid[rowIndex + i][colIndex + j];
          
          // Emptyには置けない
          if (targetCell.type === 'Empty') {
            return false;
          }
  
          // // neutralなセルには置けない（開始、ゴール、ダミーゴールなど）
          // const cellDef = CELL_DEFINITIONS[targetCell.type];
          // if ('neutral' in cellDef) {
          //   return false;
          // }
        }
      }
    }
  
    return true;
  };
  
  const triggerFileInput = () => {
    const input = document.getElementById('yamlImport') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <Card className="flex-grow bg-[#B3B9D1]">
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
        >
          {grid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              renderGridCell(cellType, rowIndex, colIndex)
            )),
          )}
        </div>

        <div className="flex flex-col gap-4 mt-4">
  {/* 行操作 */}
  <div className="flex flex-col gap-2">
    <span className="font-semibold text-lg">行</span>
    <div className="flex gap-4">
      {/* 行 先頭 */}
      <div className="flex items-center gap-2">
        <span>先頭</span>
        <Button onClick={() => adjustGridSize(1, 0, true)} className="flex items-center justify-center w-10 h-10">
          <Add />
        </Button>
        <Button onClick={() => adjustGridSize(-1, 0, true)} className="flex items-center justify-center w-10 h-10">
          <Remove />
        </Button>
      </div>
      {/* 行 末尾 */}
      <div className="flex items-center gap-2">
        <span>末尾</span>
        <Button onClick={() => adjustGridSize(1, 0)} className="flex items-center justify-center w-10 h-10">
          <Add />
        </Button>
        <Button onClick={() => adjustGridSize(-1, 0)} className="flex items-center justify-center w-10 h-10">
          <Remove />
        </Button>
      </div>
    </div>
  </div>

  {/* 列操作 */}
  <div className="flex flex-col gap-2">
    <span className="font-semibold text-lg">列</span>
    <div className="flex gap-4">
      {/* 列 先頭 */}
      <div className="flex items-center gap-2">
        <span>先頭</span>
        <Button onClick={() => adjustGridSize(0, 1, true)} className="flex items-center justify-center w-10 h-10">
          <Add />
        </Button>
        <Button onClick={() => adjustGridSize(0, -1, true)} className="flex items-center justify-center w-10 h-10">
          <Remove />
        </Button>
      </div>
      {/* 列 末尾 */}
      <div className="flex items-center gap-2">
        <span>末尾</span>
        <Button onClick={() => adjustGridSize(0, 1)} className="flex items-center justify-center w-10 h-10">
          <Add />
        </Button>
        <Button onClick={() => adjustGridSize(0, -1)} className="flex items-center justify-center w-10 h-10">
          <Remove />
        </Button>
      </div>
    </div>
  </div>
</div>
  

        <div className="flex gap-2 mt-4">
          <Button onClick={() => exportStageToYaml(grid, panels)} className="flex items-center gap-2">
            <Download size={16} /> YAMLエクスポート
          </Button>
          <input
            type="file"
            accept=".yaml,.yml"
            onChange={(event) => importStageFromYaml(event, setGrid, setPanels)}
            className="hidden"
            id="yamlImport"
          />
          <label htmlFor="yamlImport" className="cursor-pointer">
            <Button onClick={triggerFileInput} variant="outline" className="flex items-center gap-2">
              <Upload size={16} /> YAMLインポート
            </Button>
          </label>
          <Button onClick={() => shareStageUrl(grid, panels)} className="mt-4 flex items-center gap-2">
            <Link size={16} /> URLを生成
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};