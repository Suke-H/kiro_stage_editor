import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  Panel,
  PanelCellTypeKey,
  CopyPanel,
} from "@/types/panel";
import { Button } from "@/components/ui/button";
import { Add, Remove } from "@mui/icons-material";
import { Switch } from "@/components/ui/switch";

import { createPanelSlice } from "../../store/slices/create-panel-slice";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { copyPanelListSlice } from "../../store/slices/copy-panel-list-slice";

import { RootState } from "../../store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GridCell } from "@/types/grid";

export const NewPanelCreator: React.FC = () => {
  const [isCut, setIsCut] = useState<boolean>(false);
  const dispatch = useDispatch();

  const newPanelGrid = useSelector(
    (state: RootState): PanelCellTypeKey[][] => state.createPanel.newPanelGrid
  );

  /* Black / White → GridCell 変換（CopyPanel 用） */
  const toGridCell = (cell: PanelCellTypeKey): GridCell => ({
    type: cell === "Black" ? "Normal" : "Empty",
    side: cell === "Black" ? "back" : "front",
  });

  /* 追加ボタン*/
  const addPanel = (): void => {
    // Black が 1 マスも無い場合は無視
    const hasBlack = newPanelGrid.some(row => row.includes("Black"));
    if (!hasBlack) return;

    // 通常パネル
    if (!isCut) {
      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        cells: newPanelGrid,
        type: "Normal",
      };
      dispatch(panelListSlice.actions.createPanel(newPanel));
    }

    // 切り取りパネル
    else {
      const copyCells: GridCell[][] = newPanelGrid.map(row =>
        row.map(toGridCell)
      );

      const newCopyPanel: CopyPanel = {
        id: `copy-${Date.now()}`,
        cells: copyCells,
        type: "Paste",
      };
      dispatch(copyPanelListSlice.actions.createPanel(newCopyPanel));
    }

    /* 入力グリッドを初期化 */
    dispatch(createPanelSlice.actions.initPanelGrid());
  };

  return (
    <Card className="w-64 bg-[#B3B9D1] md:self-start">
      <CardHeader>
        <CardTitle>パネル作成</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* 行・列操作 */}
          <div className="grid grid-cols-2 gap-4 text-left">
            {/* 行 */}
            <div>
              <span className="font-semibold ml-4">行</span>
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  onClick={() => dispatch(createPanelSlice.actions.addToRow())}
                  className="flex items-center justify-center w-10 h-10"
                >
                  <Add />
                </Button>
                <Button
                  onClick={() =>
                    dispatch(createPanelSlice.actions.removeFromRow())
                  }
                  className="flex items-center justify-center w-10 h-10"
                >
                  <Remove />
                </Button>
              </div>
            </div>
            {/* 列 */}
            <div>
              <span className="font-semibold ml-4">列</span>
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  onClick={() => dispatch(createPanelSlice.actions.addToCol())}
                  className="flex items-center justify-center w-10 h-10"
                >
                  <Add />
                </Button>
                <Button
                  onClick={() =>
                    dispatch(createPanelSlice.actions.removeFromCol())
                  }
                  className="flex items-center justify-center w-10 h-10"
                >
                  <Remove />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* パネルプレビュー */}
        <div
          className="grid mt-4 mb-4 ml-1"
          style={{
            gridTemplateColumns: `repeat(${newPanelGrid[0]?.length ?? 0}, 40px)`,
            gap: "4px",
          }}
        >
          {newPanelGrid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`new-${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${
                  cellType === "Black"
                    ? "bg-gray-500"
                    : cellType === "Cut"
                    ? "bg-yellow-300"
                    : "bg-white"
                }`}
                onClick={() =>
                  dispatch(
                    createPanelSlice.actions.clickToCell({
                      row: rowIndex,
                      col: colIndex,
                    })
                  )
                }
              />
            ))
          )}
        </div>

        <Button onClick={addPanel} className="w-full flex items-center gap-2">
          <Plus size={16} /> パネル追加
        </Button>

        {/* 切り取りモードトグル */}
        <div className="flex items-center gap-2 mt-4">
          <Switch checked={isCut} onCheckedChange={setIsCut} />
          <span>{isCut ? "切り取りモードON" : "切り取りモードOFF"}</span>
        </div>
      </CardContent>
    </Card>
  );
};
