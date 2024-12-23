import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Download, Upload, Link } from 'lucide-react';
import { CellType, Panel, PanelPlacementModeType, PanelPlacementHistoryType } from '../types';
import { CELL_TYPES } from '../../constants/cell-types';
import { exportStageToJson, importStageFromJson } from '../../utils/json';
// import { shareStageUrl } from '../../utils/url';
import { shareStageUrl } from '../../utils/url';

interface GridProps {
  grid: CellType[][];
  setGrid: React.Dispatch<React.SetStateAction<CellType[][]>>;
  setGridHistory: React.Dispatch<React.SetStateAction<CellType[][][]>>;
  selectedCellType: CellType;
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

  // グリッドセルのクリックハンドラを修正
  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    // 通常のセル選択モード
    if (!panelPlacementMode.panel) {
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = selectedCellType;
      setGrid(newGrid);
      setGridHistory(prev => [...prev, newGrid]);
      return;
    }

    // パネル配置モード
    const placingPanel = panelPlacementMode.panel;
    const panelRows = placingPanel.cells.length;
    const panelCols = placingPanel.cells[0].length;

    // パネルを配置できるかチェック
    const canPlacePanel =
      rowIndex + panelRows <= grid.length &&
      colIndex + panelCols <= grid[0].length;

    if (canPlacePanel) {
      const updatedGrid = grid.map((row) => [...row]);

      for (let i = 0; i < panelRows; i++) {
        for (let j = 0; j < panelCols; j++) {
          if (placingPanel.cells[i][j] === 'black') {
            updatedGrid[rowIndex + i][colIndex + j] = 
              updatedGrid[rowIndex + i][colIndex + j] === 'black' ? 'white' : 'black';
          }
        }
      }

      // 現在のグリッド状態を履歴に追加
      setGridHistory(prev => [...prev, updatedGrid]);
      setPanelPlacementHistory(prev => [...prev, panelPlacementMode]);

      setGrid(updatedGrid);
    }

    // パネル配置モードをリセット
    setPanelPlacementMode({
      panel: null,
      highlightedCell: null,
    });
  };

  // グリッドビューのレンダリングを修正
  const renderGridCell = (cellType: CellType, rowIndex: number, colIndex: number) => {
    console.log(cellType);
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`h-10 w-10 border ${CELL_TYPES[cellType].color}`}
        onClick={() => handleGridCellClick(rowIndex, colIndex)}
      />
    );
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

        <div className="flex gap-2 mt-4">
          <Button onClick={() => exportStageToJson(grid, panels)} className="flex items-center gap-2">
            <Download size={16} /> JSONエクスポート
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={(event) => importStageFromJson(event, setGrid, setPanels)}
            className="hidden"
            id="jsonImport"
          />
          <label htmlFor="jsonImport" className="cursor-pointer">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload size={16} /> JSONインポート
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