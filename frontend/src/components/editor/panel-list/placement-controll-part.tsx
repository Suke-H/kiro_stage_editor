import { Button } from "@/components/ui/button";
import { panelPlacementSlice } from "../../../store/slices/panel-placement-slice";
import { panelListSlice } from "../../../store/slices/panel-list-slice";
import { gridSlice } from "../../../store/slices/grid-slice";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";

export const PlacementControllPart: React.FC = () => {
  const dispatch = useDispatch();
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  
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
        variant="destructive"
        className="flex items-center gap-2 w-20 text-left"      
      >
        リセット
      </Button>
    </div>
  );
};
