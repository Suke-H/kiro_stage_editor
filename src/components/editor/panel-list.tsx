import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Move } from 'lucide-react';
import { Panel } from '../types';

interface PanelListProps {
  panels: Panel[];
  onRemovePanel: (panelId: string) => void;
  onPanelDragStart: (panel: Panel) => void;
  onPanelDragEnd: () => void;
}

export const PanelList: React.FC<PanelListProps> = ({
  panels,
  onRemovePanel,
  onPanelDragStart,
  onPanelDragEnd
}) => {
  return (
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
            onDragStart={() => onPanelDragStart(panel)}
            onDragEnd={onPanelDragEnd}
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
            <Button variant="ghost" size="icon" onClick={() => onRemovePanel(panel.id)}>
              <Trash2 size={16} />
            </Button>
            <Move size={16} className="text-gray-500" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};