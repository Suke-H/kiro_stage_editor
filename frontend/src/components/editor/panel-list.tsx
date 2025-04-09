import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";
import { Panel, StudioMode } from "../types";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";

import { PlacementControllPart } from "./panel-list/placement-controll-part";

export const PanelList: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector((state: RootState) => state.studioMode.studioMode);
  const panels = useSelector((state: RootState) => state.panelList.panels);
  const panelPlacementMode = useSelector(
    (state: RootState) => state.panelPlacement.panelPlacementMode
  );

  // パネル配置モードの開始
  const startPanelPlacement = (panel: Panel) => {
    // 同じパネルが選択された場合、選択解除
    if (panelPlacementMode.panel === panel) {
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
      return;
    }

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

  // パネルビューのレンダリングを修正
  const renderPanels = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-start max-w-full">
        {panels.map((panel) => (
          <div key={panel.id} className="flex flex-col items-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${panel.cells[0].length}, 40px)`,
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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startPanelPlacement(panel)}
              >
                <Move size={16} />
              </Button>
              {studioMode === StudioMode.Editor && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(panelListSlice.actions.removePanel(panel.id))}
                >
                  <Trash2 size={16} />
                </Button>
              )}

            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex-1 bg-[#B3B9D1] min-w-[300px] max-w-[600px]">
      <CardHeader>
        <CardTitle>パネル</CardTitle>
      </CardHeader>
      <CardContent>
        <PlacementControllPart />
        {renderPanels()}
      </CardContent>
    </Card>
  );
};
