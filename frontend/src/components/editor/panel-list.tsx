// components/PanelList.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Move } from "lucide-react";

import { Panel, CopyPanel, PanelCellTypeKey, PANEL_CELL_TYPES } from "@/types/panel";
import {
  GridCell,
  GridCellKey,
  // GRID_CELL_TYPES,
  // CellSideInfo,
} from "@/types/grid";

import { StudioMode, StudioModeInEditor } from "@/types/store";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { copyPanelListSlice } from "../../store/slices/copy-panel-list-slice";      // ★ 追加
import { panelPlacementSlice } from "../../store/slices/panel-placement-slice";
import { studioModeInEditorSlice } from "../../store/slices/studio-mode-in-editor-slice";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";

import { PlacementControllPart } from "./panel-list/placement-controll-part";

/* ------------------------------------------------------------------ */
/* CopyPanel -> Panel へ変換                                           */
const gridCellToPanelCell = (cell: GridCell): PanelCellTypeKey => {
  switch (cell.type as GridCellKey) {
    case "Normal":
    case "Flip":
    case "Crow":
    case "Wolf":
      return "Black";
    case "Flag":
      return "Flag";
    /* Paste 対象で空白扱いにできるマスは White として描画 */
    default:
      return "White";
  }
};

const convertCopyToPanel = (cp: CopyPanel): Panel => ({
  id: cp.id,
  cells: cp.cells.map(row => row.map(gridCellToPanelCell)),
  type: cp.type,
});
/* ------------------------------------------------------------------ */

export const PanelList: React.FC = () => {
  const dispatch = useDispatch();

  /* ストア取得 */
  const studioMode     = useSelector((s: RootState) => s.studioMode.studioMode);
  const panels         = useSelector((s: RootState) => s.panelList.panels);
  const copyPanels     = useSelector((s: RootState) => s.copyPanelList.panels);
  const panelPlacement = useSelector((s: RootState) => s.panelPlacement.panelPlacementMode);

  /* --------------------------------------------- */
  /* パネルクリックで配置モード開始                 */
  /* --------------------------------------------- */
  const startPanelPlacement = (panel: Panel) => {
    if (panelPlacement.panel === panel) {
      dispatch(panelPlacementSlice.actions.clearPanelSelection());
      return;
    }

    // 最初の Black セルをハイライト
    let firstBlackCell: { row: number; col: number } | null = null;
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
        highlightedCell: firstBlackCell ?? { row: 0, col: 0 },
      })
    );

    // Editor のときは InEditor → Play
    if (studioMode === StudioMode.Editor) {
      dispatch(
        studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Play)
      );
    }
  };

  /* --------------------------------------------- */
  /* 既存 panel-list 描画                          */
  /* --------------------------------------------- */
  const renderPanelItems = (list: Panel[], isCopyList: boolean) => (
    <>
      {list.map((panel: Panel) => {
        const isSelected = panelPlacement.panel === panel;
        return (
          <div key={panel.id} className="flex flex-col items-center">
            {/* グリッド画像 */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${panel.cells[0]?.length ?? 0}, 40px)` }}
            >
              {panel.cells.map((row, ri) =>
                row.map((cellType: PanelCellTypeKey, ci) => {
                  const cellInfo = PANEL_CELL_TYPES[cellType];
                  const isHighlight =
                    isSelected &&
                    panelPlacement.highlightedCell?.row === ri &&
                    panelPlacement.highlightedCell?.col === ci;

                  return (
                    <div
                      key={`${ri}-${ci}`}
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

            {/* 操作ボタン */}
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
                    dispatch(
                      isCopyList
                        ? copyPanelListSlice.actions.removePanel(panel.id)     // ★ CopyPanel 用
                        : panelListSlice.actions.removePanel(panel.id)         // ★ 既存
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

  /* --------------------------------------------- */
  /* JSX: レイアウトは 1 byte も変えない            */
  /* --------------------------------------------- */
  return (
    <Card className="flex-1 bg-[#B3B9D1] min-w-[300px] max-w-[600px]">
      <CardHeader>
        <CardTitle>パネル</CardTitle>
      </CardHeader>
      <CardContent>
        <PlacementControllPart />

        {/* ===== 既存 panel-list ===== */}
        <div className="flex flex-wrap gap-2 justify-start max-w-full">
          {renderPanelItems(panels, false)}
        </div>

        {/* ===== copy-panel-list ===== */}
        <div className="flex flex-wrap gap-2 justify-start max-w-full mt-4">
          {renderPanelItems(copyPanels.map(convertCopyToPanel), true)}
        </div>
      </CardContent>
    </Card>
  );
};
