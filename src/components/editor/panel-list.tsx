import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Move } from 'lucide-react';
import { Panel } from '../types';

interface PanelListProps {
  panels: Panel[];
  setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  setDraggingPanel: React.Dispatch<React.SetStateAction<Panel | null>>;
}

export const PanelList: React.FC<PanelListProps> = ({
  panels,
  setPanels,
  setDraggingPanel,
}) => {

  const removePanel = (panelId: string) => {
      setPanels(panels.filter(panel => panel.id !== panelId));
    };
    
  const handlePanelDragStart = (panel: Panel) => {
    setDraggingPanel(panel);
  };
  
  const handlePanelDragEnd = () => {
    setDraggingPanel(null);
  };

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
  );
};