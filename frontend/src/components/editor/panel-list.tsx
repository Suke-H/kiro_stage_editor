import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import {
  Panel,
  CopyPanel,
  PanelCellTypeKey,
  PANEL_CELL_TYPES,
} from "@/types/panel";

import {
  GridCell,
  GridCellKey,
} from "@/types/grid";

import { StudioMode, StudioModeInEditor } from "@/types/store";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { copyPanelListSlice } from "../../store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";
import { studioModeInEditorSlice } from "../../store/slices/studio-mode-in-editor-slice";

import { PlacementControllPart } from "./panel-list/placement-controll-part";

/* CopyPanel -> Panel 変換（描画 & Placement 用） */
const gridToPanelCell = (cell: GridCell): PanelCellTypeKey => {
  switch (cell.type as GridCellKey) {
    case "Normal":
    case "Flip":
    case "Crow":
    case "Wolf":
      return "Black";
    case "Flag":
      return "Flag";
    default:
      return "White";
  }
};
const convertCopyToPanel = (cp: CopyPanel): Panel => ({
  id: cp.id,
  type: cp.type,
  cells: cp.cells.map((row) => row.map(gridToPanelCell)),
});

export const PanelList: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode   = useSelector((s: RootState) => s.studioMode.studioMode);
  const panels       = useSelector((s: RootState) => s.panelList.panels);
  const copyPanels   = useSelector((s: RootState) => s.copyPanelList.panels);
  const placement    = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);

  /* パネル選択 */
  const selectPanel = (panel: Panel) => {
    if (placement.panel === panel) {
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
      return;
    }

    /* 最初の Black をハイライト */
    let highlight = { row: 0, col: 0 };
    outer: for (let i = 0; i < panel.cells.length; i++) {
      for (let j = 0; j < panel.cells[i].length; j++) {
        if (panel.cells[i][j] === "Black") {
          highlight = { row: i, col: j };
          break outer;
        }
      }
    }

    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel,
        highlightedCell: highlight,
      })
    );

    if (studioMode === StudioMode.Editor) {
      dispatch(
        studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Play)
      );
    }
  };

  /* 共通描画関数 */
  const renderList = (
    list: Panel[],
    isCopy: boolean /* 削除 dispatch の切替 */
  ) => (
    <>
      {list.map((p) => {
        const selected = placement.panel === p;
        return (
          <div key={p.id} className="flex flex-col items-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${p.cells[0]?.length ?? 0}, 40px)`,
              }}
            >
              {p.cells.map((row, ri) =>
                row.map((cell, ci) => {
                  const cellInfo = PANEL_CELL_TYPES[cell];
                  const highlight =
                    selected &&
                    placement.highlightedCell?.row === ri &&
                    placement.highlightedCell?.col === ci;
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={`h-10 w-10 ${
                        highlight ? "ring-2 ring-red-500" : ""
                      }`}
                    >
                      <img
                        src={`/cells/${cellInfo.picture}`}
                        alt={cellInfo.code}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => selectPanel(p)}>
                <Move size={16} />
              </Button>
              {studioMode === StudioMode.Editor && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    dispatch(
                      isCopy
                        ? copyPanelListSlice.actions.removePanel(p.id)
                        : panelListSlice.actions.removePanel(p.id)
                    )
                  }
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <Card className="flex-1 bg-[#B3B9D1] min-w-[300px] max-w-[600px]">
      <CardHeader>
        <CardTitle>パネル</CardTitle>
      </CardHeader>
      <CardContent>
        <PlacementControllPart />

        {/* panel-list（Normal / Cut / Flag） */}
        <div className="flex flex-wrap gap-2 max-w-full">{renderList(panels, false)}</div>

        {/* copy-panel-list（Paste 用） */}
        <div className="flex flex-wrap gap-2 max-w-full mt-4">
          {renderList(copyPanels.map(convertCopyToPanel), true)}
        </div>
      </CardContent>
    </Card>
  );
};
