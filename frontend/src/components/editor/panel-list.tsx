import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";
import { Panel } from "../types";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";
import { gridSlice } from "../../store/slices/grid-slice";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";

export const PanelList: React.FC = () => {
  const dispatch = useDispatch();
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  const panels = useSelector((state: RootState) => state.panelList.panels);
  const panelPlacementMode = useSelector(
    (state: RootState) => state.panelPlacement.panelPlacementMode
  );
  const panelPlacementHistory = useSelector(
    (state: RootState) => state.panelPlacement.panelPlacementHistory
  );

  // パネル配置モードの開始
  const startPanelPlacement = (panel: Panel) => {
    let firstBlackCell = null;
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[0].length; j++) {
        if (panel.cells[i][j] === "Black") {
          firstBlackCell = { row: i, col: j };
          break;
        }
      }
      if (firstBlackCell) break;
    }

    // パネル配置モードの開始
    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel: panel,
        highlightedCell: firstBlackCell || { row: 0, col: 0 },
      })
    );
  };

  // 「1つ戻す」メソッド
  const undoLastPlacement = () => {
    if (gridHistory.length > 1) {
      const newGridHistory = [...gridHistory];
      newGridHistory.pop(); // 最後の状態を削除
      // setGrid(newGridHistory[newGridHistory.length - 1]);
      // setGridHistory(newGridHistory);

      dispatch(gridSlice.actions.undo());

      const newPanelPlacementHistory = [...panelPlacementHistory];
      newPanelPlacementHistory.pop();
      // setPanelPlacementMode(
      //   newPanelPlacementHistory.length > 0
      //     ? newPanelPlacementHistory[newPanelPlacementHistory.length - 1]
      //     : { panel: null, highlightedCell: null }
      // );
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement(
          newPanelPlacementHistory.length > 0
            ? newPanelPlacementHistory[newPanelPlacementHistory.length - 1]
            : { panel: null, highlightedCell: null }
        )
      );
      dispatch(panelPlacementSlice.actions.undo());
    }
  };

  // 「リセット」メソッド
  const resetPanelPlacement = () => {
    if (gridHistory.length > 1) {
      // グリッドとパネル配置履歴をリセット
      dispatch(gridSlice.actions.reset());
      dispatch(panelPlacementSlice.actions.reset());

      // パネル配置モードの終了
      dispatch(
        panelPlacementSlice.actions.selectPanelForPlacement({
          panel: null,
          highlightedCell: null,
        })
      );
    }
  };

  // パネルビューのレンダリングを修正
  const renderPanels = () => {
    return panels.map((panel) => (
      <div key={panel.id} className="flex items-center gap-2 mb-2 relative">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${panel.cells[0].length}, 40px)`,
            maxWidth: "160px",
          }}
        >
          {panel.cells.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${
                  panelPlacementMode.panel === panel &&
                  rowIndex === 0 &&
                  colIndex === 0
                    ? "bg-red-500"
                    : cellType === "Black"
                    ? "bg-gray-500"
                    : "bg-white"
                }`}
              />
            ))
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(panelListSlice.actions.removePanel(panel.id))}
        >
          <Trash2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startPanelPlacement(panel)}
        >
          <Move size={16} />
        </Button>
      </div>
    ));
  };

  return (
    <div className="flex gap-4">
      {/* パネル設置取り消しボタン */}
      <div className="flex gap-2 mt-2">
        <Button
          onClick={undoLastPlacement}
          disabled={gridHistory.length <= 1}
          className="flex-grow"
        >
          1つ戻す
        </Button>
        <Button
          onClick={resetPanelPlacement}
          disabled={gridHistory.length <= 1}
          variant="destructive"
          className="flex-grow"
        >
          リセット
        </Button>
      </div>
      <Card className="w-64 bg-[#B3B9D1]">
        <CardHeader>
          <CardTitle>パネル</CardTitle>
        </CardHeader>
        <CardContent>{renderPanels()}</CardContent>
      </Card>
    </div>
  );
};
