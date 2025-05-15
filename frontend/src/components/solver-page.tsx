import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState } from "../store";
import { solutionActions } from "../store/slices/solution-slice";

import { PlaySolveAsync } from '@/api/solve';

import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";

const SolverPage: React.FC = () => {

  const panels = useSelector((state: RootState) => state.panelList.panels);
  const grid = useSelector((state: RootState) => state.grid.grid);

  const dispatch = useDispatch();

  const Solve = async () => {
    const res= await PlaySolveAsync(grid, panels);

    dispatch(solutionActions.setSolutions(res.solutions));
    dispatch(
      solutionActions.buildNumberGrid({
        rows: grid.length,
        cols: grid[0].length,
      })
    );
  }

  return (
    <Card className="w-full max-w-[800px] bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>解探索モード</CardTitle>
        <CardDescription>「パネルの置き方が何通りあるか」を探索する機能の予定です。鋭意制作中......</CardDescription>
      </CardHeader>
      <CardContent>
        <img src="/kirochan.png" width="50px" alt="工事中" />
      </CardContent>

      <div className="flex gap-4 flex-col md:flex-row">
        <GridViewer />
        <PanelList />
      </div>

      <div className="flex justify-center mb-2">
        <Button
          variant="secondary"
          className="w-1/2"
          onClick={Solve}
        >
          Solve
        </Button>
      </div>
    </Card>
  );
  };
  
  export default SolverPage;