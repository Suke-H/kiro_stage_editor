import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { solutionActions } from "@/store/slices/solution-slice";
import { SolverPanelList } from '@/components/solver/solver-panel-list';
import { PlaySolveAsync } from "@/api/solve";

import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";
import { SolverGridViewer } from "@/components/solver/solver-grid-viewer";

const SolverPage: React.FC = () => {
  const dispatch = useDispatch();

  const grid      = useSelector((s: RootState) => s.grid.grid);
  const panels    = useSelector((s: RootState) => s.panelList.panels);
  const solutions = useSelector((s: RootState) => s.solution.solutions);

  const solve = async () => {
    const res = await PlaySolveAsync(grid, panels);
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
          <div className="flex justify-center">
            <Button variant="secondary" className="w-1/4" onClick={solve}>
              Solve
            </Button>
          </div>

          <div className="flex flex-col gap-8">
            {solutions.map((_, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <SolverGridViewer baseGrid={grid} index={idx} />
                <SolverPanelList solutionIndex={idx} />
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </>
  );
};

export default SolverPage;
