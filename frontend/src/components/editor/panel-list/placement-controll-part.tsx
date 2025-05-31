import { Button } from "@/components/ui/button";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { gridSlice } from "@/store/slices/grid-slice";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

import { PlaySimulateAsync } from "@/api/play-simulate";
import { Result, resultMessages } from "@/types/path";

// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner";

export const PlacementControllPart: React.FC = () => {
  const dispatch = useDispatch();
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  const grid = useSelector((state: RootState) => state.grid.grid);

  // const { toast } = useToast();
  
  // 「1つ戻す」メソッド
  const undoLastPlacement = () => {
    dispatch(panelListSlice.actions.undo());
    dispatch(gridSlice.actions.undo());
  };

  // 「リセット」メソッド
  const resetPanelPlacement = () => {
    // グリッドとパネル配置履歴をリセット
    dispatch(panelListSlice.actions.reset());
    dispatch(gridSlice.actions.reset());

    // パネル配置モードの終了
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
  };

  // 「再生」メソッド
  const playSimulation = async () => {
      const _pathResult = await PlaySimulateAsync(grid);

      // 対応するResultMessageをポップアップ
      if (_pathResult.result === Result.HasClearPath)
          toast.success(resultMessages[_pathResult.result]) ;
      else
          toast.info(resultMessages[_pathResult.result]) ;
      
      // クリアした場合、足あと配置
      if (_pathResult.result === Result.HasClearPath)
        dispatch(gridSlice.actions.placeFootprints(_pathResult));
  };
    

  return (
    <div className="flex gap-2 mb-10">
      <Button
        onClick={undoLastPlacement}
        disabled={gridHistory.length < 1}
        className="flex items-center gap-2 w-20 text-left"              

      >
        1つ戻す
      </Button>
      <Button
        onClick={resetPanelPlacement}
        disabled={gridHistory.length < 1}
        variant="secondary"
        className="flex items-center gap-2 w-20 text-left"      
      >
        リセット
      </Button>
      <Button
        onClick={playSimulation}
        variant="destructive"
        className="flex items-center gap-2 w-20 text-left"      
      >
        再生
      </Button>
    </div>
  );
};
