import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MinusCircle, Plus } from "lucide-react";
import { Panel } from "../types";

import { createPanelSlice } from "../../store/slices/create-panel-slice";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

export const NewPanelCreator: React.FC = () => {
  const dispatch = useDispatch();
  const newPanelGrid = useSelector(
    (state: RootState) => state.createPanel.newPanelGrid
  );

  const addPanel = () => {
    const nonEmptyCells = newPanelGrid.some((row) =>
      row.some((cell) => cell === "Black")
    );
    if (nonEmptyCells) {
      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        cells: newPanelGrid,
      };

      // パネル追加
      dispatch(panelListSlice.actions.createPanel(newPanel));
      // グリッドは初期化させる
      dispatch(createPanelSlice.actions.initPanelGrid());
    }
  };

  return (
    <Card className="w-64 bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>パネル作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => dispatch(createPanelSlice.actions.addToRow())}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} /> 行追加
          </Button>
          <Button
            onClick={() => dispatch(createPanelSlice.actions.removeFromRow())}
            className="flex items-center gap-2"
          >
            <MinusCircle size={16} /> 行削除
          </Button>
          <Button
            onClick={() => dispatch(createPanelSlice.actions.addToCol())}
            className="flex items-center gap"
          >
            <PlusCircle size={16} /> 列追加
          </Button>
          <Button
            onClick={() => dispatch(createPanelSlice.actions.removeFromCol())}
            className="flex items-center gap-2"
          >
            <MinusCircle size={16} /> 列削除
          </Button>
        </div>
        <div
          className="grid mb-4"
          style={{
            gridTemplateColumns: `repeat(${newPanelGrid[0].length}, 40px)`,
            gap: "4px",
          }}
        >
          {newPanelGrid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`new-${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${
                  cellType === "Black" ? "bg-gray-500" : "bg-white"
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
      </CardContent>
    </Card>
  );
};
