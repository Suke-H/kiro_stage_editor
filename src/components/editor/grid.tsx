import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Download, Upload } from 'lucide-react';
import { CellType } from '../types';
import { CELL_TYPES } from '../../constants/cell-types';

interface GridProps {
  grid: CellType[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onGridSizeChange: (rowDelta: number, colDelta: number) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  onCellClick,
  onGridSizeChange,
  onExport,
  onImport,
  onDragOver,
  onDrop
}) => {
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
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {grid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${CELL_TYPES[cellType].color}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            )),
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => onGridSizeChange(1, 0)} className="flex items-center gap-2">
            <PlusCircle size={16} /> 行追加
          </Button>
          <Button onClick={() => onGridSizeChange(-1, 0)} className="flex items-center gap-2">
            <MinusCircle size={16} /> 行削除
          </Button>
          <Button onClick={() => onGridSizeChange(0, 1)} className="flex items-center gap-2">
            <PlusCircle size={16} /> 列追加
          </Button>
          <Button onClick={() => onGridSizeChange(0, -1)} className="flex items-center gap-2">
            <MinusCircle size={16} /> 列削除
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onExport} className="flex items-center gap-2">
            <Download size={16} /> JSONエクスポート
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={onImport}
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