import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";
import {
  Panel,
  // PanelPlacementModeType,
  // PanelPlacementHistoryType,
  // GridCell,
  // PanelPlacementModeType,
} from "../types";
import { panelSlice } from "../../store/slices/panel-slice";
import { gridSlice } from "../../store/slices/grid-slice";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";

// interface PanelListProps {
  // panels: Panel[];
  // setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  // panelPlacementMode: PanelPlacementModeType;
  // setPanelPlacementMode: React.Dispatch<
  //   React.SetStateAction<PanelPlacementModeType>
  // >;
  // panelPlacementHistory: PanelPlacementHistoryType;
  // setPanelPlacementHistory: React.Dispatch<
  //   React.SetStateAction<PanelPlacementHistoryType>
  // >;
  // setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>;
  // gridHistory: GridCell[][][];
  // setGridHistory: React.Dispatch<React.SetStateAction<GridCell[][][]>>;
// }

export const PanelList: React.FC = (
  // panels,
  // setPanels,
  // panelPlacementMode,
  // setPanelPlacementMode,
  // panelPlacementHistory,
  // setPanelPlacementHistory,
  // setGrid,
  // gridHistory,
  // setGridHistory,
) => {
  // const removePanel = (panelId: string) => {
  //   setPanels(panels.filter((panel) => panel.id !== panelId));
  // };

  const dispatch = useDispatch();
  const gridHistory = useSelector((state: RootState) => state.grid.gridHistory);
  const panels = useSelector((state: RootState) => state.panel.panels);
  const panelPlacementMode = useSelector((state: RootState) => state.panel.panelPlacementMode);
  const panelPlacementHistory = useSelector((state: RootState) => state.panel.panelPlacementHistory);

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

    dispatch(
      panelSlice.actions.selectPanelForPlacement({
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
        panelSlice.actions.selectPanelForPlacement(
          newPanelPlacementHistory.length > 0
            ? newPanelPlacementHistory[newPanelPlacementHistory.length - 1]
            : { panel: null, highlightedCell: null }
        )
      );
      // setPanelPlacementHistory(newPanelPlacementHistory);
      dispatch(panelSlice.actions.undoPlacement());
    }
  };

  // 「リセット」メソッド
  const resetPanelPlacement = () => {
    if (gridHistory.length > 1) {
      // setGrid(gridHistory[0]);
      // setGridHistory([gridHistory[0]]);
      dispatch(gridSlice.actions.reset());

      // setPanelPlacementMode({ panel: null, highlightedCell: null });
      dispatch(
        panelSlice.actions.selectPanelForPlacement(
          { panel: null, highlightedCell: null }
        )
      );
      // setPanelPlacementHistory([]);
      dispatch(panelSlice.actions.resetPlacementHistory());
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
          onClick={
            // () => removePanel(panel.id)
            () => dispatch(panelSlice.actions.removePanel(panel.id))
          }
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
