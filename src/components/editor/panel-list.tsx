import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move, Scissors, Copy as CopyIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import {
  Panel,
  CopyPanel,
  PanelCellTypeKey,
  PANEL_CELL_TYPES,
} from "@/types/panel";
import {
  GRID_CELL_TYPES,
  GridCell,
  CellSideInfo,
} from "@/types/grid";

import { StudioMode, StudioModeInEditor } from "@/types/store";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { copyPanelListSlice } from "@/store/slices/copy-panel-list-slice";
import { panelPlacementSlice } from "@/store/slices/panel-placement-slice";
import { studioModeInEditorSlice } from "@/store/slices/studio-mode-in-editor-slice";

import { PlacementControllPart } from "./panel-list/placement-controll-part";

/* ----- CopyPanel -> Panel 変換（配置用） ----- */
const gridToPanelCell = (cell: GridCell): PanelCellTypeKey =>
  cell.type === "Flag"
    ? "Flag"
    : cell.type === "Empty"
    ? "White"
    : "Black";

const toPanel = (cp: CopyPanel): Panel => ({
  id: cp.id,
  type: cp.type,
  cells: cp.cells.map((row) => row.map(gridToPanelCell)),
});
/* ------------------------------------------- */

export const PanelList: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector((s: RootState) => s.studioMode.studioMode);
  const panels     = useSelector((s: RootState) => s.panelList.panels);
  const copyPanels = useSelector((s: RootState) => s.copyPanelList.copyPanels);
  const placement  = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);

  /* -------- パネル選択 -------- */
  const selectPanel = (panel: Panel) => {
    if (placement.panel?.id === panel.id) {
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
      return;
    }
    /* ハイライト位置は最初の Black */
    let hl = { row: 0, col: 0 };
    outer: for (let i = 0; i < panel.cells.length; i++)
      for (let j = 0; j < panel.cells[i].length; j++)
        if (panel.cells[i][j] === "Black") {
          hl = { row: i, col: j };
          break outer;
        }

    dispatch(
      panelPlacementSlice.actions.selectPanelForPlacement({
        panel,
        highlightedCell: hl,
      })
    );

    if (studioMode === StudioMode.Editor)
      dispatch(studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Play));
  };

  /* -------- Normal / Cut / Flag 用描画 -------- */
  const renderPanelCell = (cell: PanelCellTypeKey) => {
    const info = PANEL_CELL_TYPES[cell];
    return (
      <img src={`/cells/${info.picture}`} alt={info.code} className="w-full h-full object-contain" />
    );
  };

  /* -------- CopyPanel 用描画 -------- */
  const renderGridCell = (cell: GridCell) => {
    const def = GRID_CELL_TYPES[cell.type];
    const side: CellSideInfo | undefined = def[cell.side];
    return (
      <img
        src={`/cells/${side?.picture}`}
        alt={def.label}
        className="w-full h-full object-contain"
      />
    );
  };

const renderList = (
    basePanels: (Panel | CopyPanel)[],
    isCopy: boolean
  ) => (
    <>
      {basePanels.map((panelItem) => {
        // 描画・配置操作用に Panel 型へ
        const panelObj: Panel = isCopy
          ? toPanel(panelItem as CopyPanel)
          : (panelItem as Panel);

        const cellsMatrix = isCopy
          ? (panelItem as CopyPanel).cells
          : (panelItem as Panel).cells;

        const selected = placement.panel?.id === panelItem.id;

        return (
          <div key={panelItem.id} className="flex flex-col items-center">
            <div className="mb-1">
              {/** 切り取りパネル→ハサミマーク */}
                {!isCopy && panelObj.type === "Cut" && (
                  <Scissors size={20} />
                )}
              {/** コピーパネル→コピーマーク */}
              {isCopy && (
                  <CopyIcon size={20} />
                )}
              </div>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cellsMatrix[0]?.length || 1}, 40px)`,
              }}
              onClick={() => selectPanel(panelObj)}
            >
              {cellsMatrix.map((row, ri) =>
                row.map((cell, ci) => {
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
                      {isCopy
                        ? renderGridCell(cell as GridCell)
                        : renderPanelCell(cell as PanelCellTypeKey)}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectPanel(panelObj)}
              >
                <Move size={16} />
              </Button>
              {studioMode === StudioMode.Editor && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    dispatch(
                      isCopy
                        ? copyPanelListSlice.actions.removePanel(panelItem.id)
                        : panelListSlice.actions.removePanel(panelItem.id)
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

        {/* panel-list: Normal / Cut / Flag */}
        <div className="flex flex-wrap gap-2 max-w-full">
          {renderList(panels, false)}
        </div>

        {/* copy-panel-list: Paste 用 CopyPanel */}
        <div className="flex flex-wrap gap-2 max-w-full mt-4">
          {renderList(copyPanels, true)}
        </div>
      </CardContent>
    </Card>
  );
};
