import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Panel } from "@/types/panel";
import { Button } from "@/components/ui/button";
import { Add, Remove } from "@mui/icons-material";

import { createPanelSlice } from "../../store/slices/create-panel-slice";
import { panelListSlice } from "../../store/slices/panel-list-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import { CellType } from "@/types/cell";

export const NewPanelCreator: React.FC = () => {
  const dispatch = useDispatch();
  const newPanelGrid: CellType[][] = useSelector(
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
        <div
          className="grid mt-4 mb-4 ml-1"
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
