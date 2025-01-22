import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { PlusCircle, MinusCircle, Download, Upload, Link } from 'lucide-react';
import { PlusCircle, MinusCircle,  } from 'lucide-react';
import { GridCell, Panel, PanelPlacementModeType, PanelPlacementHistoryType , CellDefinitions} from '../types';
import { CELL_DEFINITIONS, CellSideInfo } from '../../constants/cell-types';
// import { exportStageToYaml, importStageFromYaml } from '../../utils/yaml';
// import { shareStageUrl } from '../../utils/url';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  panels,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPanels,
  panelPlacementMode,
  setPanelPlacementMode,
  setPanelPlacementHistory,
}) => {

  const adjustGridSize = (rowDelta: number, colDelta: number) => {
    setGrid((prevGrid) => {
      const newRows = prevGrid.length + rowDelta;
      const newCols = prevGrid[0].length + colDelta;

      if (newRows > 0 && newCols > 0) {
        if (rowDelta > 0) {
          return [...prevGrid, ...Array(rowDelta).fill(Array(newCols).fill('White'))];
        } else if (rowDelta < 0) {
          return prevGrid.slice(0, newRows).map((row) => row.slice(0, newCols));
        }

        return prevGrid.map((row) => {
          if (colDelta > 0) {
            return [...row, ...Array(colDelta).fill('White')];
          } else if (colDelta < 0) {
            return row.slice(0, newCols);
          }
          return row;
        });
      }
      return prevGrid;
    });
  };

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    // 通常のセル選択モード
    if (!panelPlacementMode.panel) {
      const newGrid = [...grid];
      
      // デフォルトでfrontかneutralを選択
      const cellDef = CELL_DEFINITIONS[selectedCellType];
      const side = 'neutral' in cellDef ? 'neutral' : 'front';
      newGrid[rowIndex][colIndex] = { type: selectedCellType, side };
  
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

      console.log('updatedGrid', updatedGrid);
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

    console.log('レンダリング');
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
        if (panelCell !== 'Empty') {
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
  
  // const triggerFileInput = () => {
  //   const input = document.getElementById('yamlImport') as HTMLInputElement;
  //   if (input) {
  //     input.click();
  //   }
  // };
  

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

        {/* <div className="flex gap-2 mt-4">
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
        </div> */}
      </CardContent>
    </Card>
  );
};