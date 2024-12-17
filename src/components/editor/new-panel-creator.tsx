import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Plus } from 'lucide-react';
import { CellType } from '../types';

interface NewPanelCreatorProps {
  newPanelGrid: CellType[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onGridSizeChange: (rowDelta: number, colDelta: number) => void;
  onAddPanel: () => void;
}

export const NewPanelCreator: React.FC<NewPanelCreatorProps> = ({
  newPanelGrid,
  onCellClick,
  onGridSizeChange,
  onAddPanel
}) => {
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>パネル追加</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
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
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            )),
          )}
        </div>
        <Button onClick={onAddPanel} className="w-full flex items-center gap-2">
          <Plus size={16} /> パネル追加
        </Button>
      </CardContent>
    </Card>
  );
};