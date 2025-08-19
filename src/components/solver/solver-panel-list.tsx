import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/store';
import { PanelPlacement } from '@/types/panel-placement';

interface SolverPanelListProps {
  solutionIndex: number;
}

export const SolverPanelList: React.FC<SolverPanelListProps> = ({ solutionIndex }) => {
  // 指定のnumberGridのインデックスに対応するパネル配置を取得
  const solutions = useSelector((state: RootState) => state.solution.solutions);
  
  // globalIndexからPanelPlacement[]を取得
  const getPlacements = (globalIndex: number): PanelPlacement[] => {
    let currentIndex = 0;
    for (const phasedSolution of solutions) {
      for (const phase of phasedSolution.phases) {
        if (currentIndex === globalIndex) {
          return phase;
        }
        currentIndex++;
      }
    }
    return [];
  };
  
  const placements = getPlacements(solutionIndex);
  if (!placements || placements.length === 0) return null;

  // 元の PanelList の renderPanels をベースに、highlight に番号を追加
  const renderPanels = () => (
    <div className="flex flex-wrap gap-2 justify-start max-w-full">
      {placements.map((placement: PanelPlacement, idx: number) => {
        const { panel, highlight } = placement;
        const number = idx + 1;
        return (
          <div key={panel.id} className="flex flex-col items-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${panel.cells[0]?.length ?? 0}, 40px)`,
              }}
            >
              {panel.cells.map((row, rowIndex) =>
                row.map((cellType, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`h-10 w-10 border flex items-center justify-center ${
                      cellType === 'Black' ? 'bg-gray-500' : 'bg-white'
                    } relative`}
                  >
                    {/* ハイライトセルに番号を重ねる */}
                    {rowIndex === highlight.y && colIndex === highlight.x && (
                      <span className="absolute inset-0 z-10 flex items-center justify-center font-bold drop-shadow pointer-events-none text-yellow-300 text-base">
                        {number}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className="mt-8 flex-1 bg-[#B3B9D1] min-w-[300px] max-w-[600px]">
      <CardHeader>
        <CardTitle>パネル</CardTitle>
      </CardHeader>
      <CardContent>
        {renderPanels()}
      </CardContent>
    </Card>
  );
};
