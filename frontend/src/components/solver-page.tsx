import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";
import { RootState } from "../store";

import { PlaySolveAsync } from '@/api/solve';

const SolverPage: React.FC = () => {

  const panels = useSelector((state: RootState) => state.panelList.panels);
  const grid = useSelector((state: RootState) => state.grid.grid);

  const Solve = async () => {
    await PlaySolveAsync(grid, panels);
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