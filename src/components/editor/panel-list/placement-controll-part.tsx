import { Button } from "@/components/ui/button";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { gridSlice } from "@/store/slices/grid-slice";
import { studioModeInEditorSlice } from "@/store/slices/studio-mode-in-editor-slice";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import { findPath } from "@/logic";
import { Result, resultMessages } from "@/types/path";
import { StudioModeInEditor } from "@/types/store";

// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner";

export const PlacementControllPart: React.FC = () => {
  const dispatch = useDispatch();
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  const phaseHistory = useSelector((state: RootState) => state.grid.phaseHistory);
  const grid = useSelector((state: RootState) => state.grid.grid);
  
  // クリア状態を管理するローカルstate
  const [isCleared, setIsCleared] = useState<boolean>(false);

  // const { toast } = useToast();
  
  // 「1つ戻す」メソッド
  const undoLastPlacement = () => {
    dispatch(panelListSlice.actions.undo());
    dispatch(gridSlice.actions.undo());
    setIsCleared(false);
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
    setIsCleared(false);
  };

  // 「フェーズリセット」メソッド
  const resetPhase = () => {
    // フェーズ履歴をリセット
    dispatch(gridSlice.actions.resetPhase());

    // グリッドとパネル配置履歴をリセット
    dispatch(panelListSlice.actions.reset());
    // グリッドの状態を初期化
    dispatch(gridSlice.actions.initHistory());
    // dispatch(gridSlice.actions.reset());

    // パネル配置モードの終了
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: null,
        highlightedCell: null,
      })
    );
    setIsCleared(false);
  };

  // 「再生」メソッド
  const playSimulation = async () => {
      // StudioModeInEditorをPlayに切り替え
      dispatch(studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Play));

      const _pathResult = findPath(grid, phaseHistory);

      // 対応するResultMessageをポップアップ
      if (_pathResult.result === Result.HasClearPath)
          toast.success(resultMessages[_pathResult.result]) ;
      else
          toast.info(resultMessages[_pathResult.result]) ;
      
      // クリアした場合は再生ボタンをdisable
      if (_pathResult.result === Result.HasClearPath) {
          setIsCleared(true);
      }
      
      // クリアした場合、または休憩地点に着いた場合、または旗に到達した場合
      if (_pathResult.result === Result.HasClearPath
        || _pathResult.result === Result.HasRestPath 
        || _pathResult.result === Result.HasFlagPath){
          // nullじゃない場合のみ配置
          if (_pathResult.nextGrid !== null)
              dispatch(gridSlice.actions.loadGrid(_pathResult.nextGrid));

          // フェーズ履歴を保存
          dispatch(gridSlice.actions.savePhaseHistory());

          // Flag以外の場合は配置履歴を初期化する
          if (_pathResult.result !== Result.HasFlagPath) {
              dispatch(gridSlice.actions.initHistory());
              dispatch(panelListSlice.actions.reset());
          }
      }

      // // テスト
      // dispatch(gridSlice.actions.savePhaseHistory());
      // // グリッド配置履歴は初期化する
      // dispatch(gridSlice.actions.initHistory());
      // dispatch(panelListSlice.actions.reset());
  };
    

  return (
    <div className="flex gap-2 mb-10">
      <Button
        onClick={undoLastPlacement}
        disabled={gridHistory.length < 2}
        className="flex items-center gap-2 w-20 text-left"              

      >
        1つ戻す
      </Button>
      <Button
        onClick={resetPanelPlacement}
        disabled={gridHistory.length < 2}
        variant="secondary"
        className="flex items-center gap-2 w-20 text-left"      
      >
        リセット
      </Button>
      <Button
        onClick={resetPhase}
        disabled={phaseHistory.length < 2}
        variant="secondary"
        className="flex items-center gap-2 w-20 text-left"      
      >
        ⌛リセット
      </Button>
      <Button
        onClick={playSimulation}
        disabled={isCleared}
        variant="destructive"
        className="flex items-center gap-2 w-20 text-left"      
      >
        再生
      </Button>
    </div>
  );
};
