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
    <Card className="w-64 bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>パネル</CardTitle>
      </CardHeader>
      <CardContent>

        {/* Playモードの場合、プレイ専用パーツを追加 */}
        {studioMode === StudioMode.Play && (
          <PlacementControllPart />
        )}
        
        {renderPanels()}
      </CardContent>
    </Card>
  );
};
