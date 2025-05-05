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

  // 「再生」メソッド
  // const playSimulation = () => {
    
  // }
  // api/judgeを実施
  // 下記を参考に
    // useEffect(() => {
    //   const checkApiConnection = async () => {
    //     try {
    //       const response = await fetch('/api/health');
    //       if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //       }
    //       const data = await response.json();
    //       console.log('API疎通確認成功:', data);
    //     } catch (error) {
    //       console.error('API疎通確認エラー:', error);
    //     }
    //   };
    //   checkApiConnection();
    // }, []);

    const playSimulation = async () => {
      try {
        const response = await fetch('/api/judge');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API疎通確認成功:', data);
      } catch (error) {
        console.error('API疎通確認エラー:', error);
      }
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
