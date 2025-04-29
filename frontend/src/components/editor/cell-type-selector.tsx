import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudioModeInEditor } from "@/types/store";
import { GridCellKey, GRID_CELL_TYPES } from "@/types/grid/";
import { cellTypeSlice } from "../../store/slices/cell-type-slice";
import { studioModeInEditorSlice } from "../../store/slices/studio-mode-in-editor-slice";
import { RootState } from "../../store";
// import { types } from "util";

export const CellTypeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedCellType = useSelector(
    (state: RootState) => state.cellType.selectedCellType
  );

  // セルをクリック -> 「Editor内スタジオモード」をEditorに変更し、セルタイプを変更
  const handleCellTypeChange = (cellType: GridCellKey) => {
    dispatch(
      studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Editor)
    );
    dispatch(cellTypeSlice.actions.changeCellType(cellType));
  };

  return (
    <Card className="w-full min-w-[120px] max-w-[300px] bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      {/* 画面幅に応じてコラムの数を変更 */}
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {(Object.keys(GRID_CELL_TYPES) as GridCellKey[]).map((type) => (
          <Button
            key={type}
            variant={selectedCellType === type ? "default" : "outline"}
            className={`w-full ${GRID_CELL_TYPES[type].color} ${
              GRID_CELL_TYPES[type].color === "bg-white"
                ? "text-black"
                : "text-white"
            } truncate`}
            onClick={() => handleCellTypeChange(type)}
          >
            {GRID_CELL_TYPES[type].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
