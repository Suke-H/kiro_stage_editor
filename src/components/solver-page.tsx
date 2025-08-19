import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { solutionActions } from "@/store/slices/solution-slice";
import { SolverPanelList } from '@/components/solver/solver-panel-list';
import { solvePuzzle } from "@/logic";

import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";
import { SolverGridViewer } from "@/components/solver/solver-grid-viewer";
import { useState } from "react";

const SolverPage: React.FC = () => {
  const dispatch = useDispatch();
  const [minimizePanels, setMinimizePanels] = useState(true);

  const grid      = useSelector((s: RootState) => s.grid.grid);
  const panels    = useSelector((s: RootState) => s.panelList.panels);
  const solutions = useSelector((s: RootState) => s.solution.solutions);

  const solve = async () => {
    const res = solvePuzzle(grid, panels, minimizePanels);
    dispatch(solutionActions.setSolutions(res.solutions));
    dispatch(
      solutionActions.buildNumberGrids({
        rows: grid.length,
        cols: grid[0].length,
      }),
    );
  };

  return (
    <>
      <div className="flex gap-4 flex-col md:flex-row mb-8">
        <GridViewer />
        <PanelList />
      </div>
    
      <Card className="w-full max-w-[1000px] bg-[#B3B9D1]">
        <CardHeader>
          <CardTitle>解探索モード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <Button variant="secondary" className="w-1/4" onClick={solve}>
                Solve
              </Button>
            </div>
            
            {/* トグルボタン */}
            <div className="flex justify-center items-center gap-2">
              <Switch checked={minimizePanels} onCheckedChange={setMinimizePanels} />
              <span>パネル設置数が最小の解を表示</span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {solutions.flatMap((phasedSolution, solutionIdx) =>
              phasedSolution.phases.map((_, phaseIdx) => {
                const globalIndex = solutions.slice(0, solutionIdx).reduce((acc, ps) => acc + ps.phases.length, 0) + phaseIdx;
                return (
                  <div key={`${solutionIdx}-${phaseIdx}`} className="flex gap-6 items-start mr-8">
                    <div className="text-sm mb-2">解{solutionIdx + 1} - フェーズ{phaseIdx + 1}</div>
                    <SolverGridViewer baseGrid={grid} index={globalIndex} />
                    <SolverPanelList solutionIndex={globalIndex} />
                  </div>
                );
              })
            )}
          </div>

        </CardContent>
      </Card>
    </>
  );
};

export default SolverPage;
