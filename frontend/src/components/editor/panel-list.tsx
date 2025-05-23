import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";
import { Panel } from "@/types/panel";
import { PanelCellTypeKey, PANEL_CELL_TYPES } from "@/types/panel";
import { StudioMode, StudioModeInEditor } from "@/types/store";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";
import { studioModeInEditorSlice } from "../../store/slices/studio-mode-in-editor-slice";
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

  const startPanelPlacement = (panel: Panel) => {
    // 同じパネルが選択された場合、選択解除
    if (panelPlacementMode.panel === panel) {
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
      return;
    }

    // 最初の Black セルを探してハイライト位置にする
    let firstBlackCell = null;
    for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[i].length; j++) {
        if (panel.cells[i][j] === "Black") {
          firstBlackCell = { row: i, col: j };
          break;
        }
      }
      if (firstBlackCell) break;
    }

    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel,
        highlightedCell: firstBlackCell || { row: 0, col: 0 },
      })
    );

    // Editor の場合は InEditor モードを Play に切り替え
    if (studioMode === StudioMode.Editor) {
      dispatch(
        studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Play)
      );
    }
  };

  const renderPanels = () => (
    <div className="flex flex-wrap gap-2 justify-start max-w-full">
      {panels.map((panel: Panel) => (
        <div key={panel.id} className="flex flex-col items-center">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${panel.cells[0]?.length ?? 0}, 40px)`,
            }}
          >
            {panel.cells.map((row, rowIndex) =>
              row.map((cellType: PanelCellTypeKey, colIndex: number) => {
                const cellInfo = PANEL_CELL_TYPES[cellType];
                const isHighlight =
                  panelPlacementMode.panel === panel &&
                  panelPlacementMode.highlightedCell?.row === rowIndex &&
                  panelPlacementMode.highlightedCell?.col === colIndex;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`h-10 w-10 ${isHighlight ? "ring-2 ring-red-500" : ""}`}
                  >
                    <img
                      src={`/cells/${cellInfo.picture}`}
                      alt={`${cellType} (${cellInfo.code})`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
              })
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
                onClick={() =>
                  dispatch(panelListSlice.actions.removePanel(panel.id))
                }
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

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
