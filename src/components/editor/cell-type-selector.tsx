import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudioModeInEditor } from "@/types/store";
import { GridCellKey, GRID_CELL_TYPES } from "@/types/grid/";
import { cellTypeSlice } from "@/store/slices/cell-type-slice";
import { studioModeInEditorSlice } from "@/store/slices/studio-mode-in-editor-slice";
import { RootState } from "@/store";

export const CellTypeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedCellType = useSelector((state: RootState) => state.cellType.selectedCellType);
  const [isGimmickFlipOn, setIsGimmickFlipOn] = useState(false);

  const handleCellTypeChange = (cellType: GridCellKey) => {
    dispatch(studioModeInEditorSlice.actions.switchMode(StudioModeInEditor.Editor));
    const side = isGimmickFlipOn ? "front" : GRID_CELL_TYPES[cellType].defaultSide;
    dispatch(cellTypeSlice.actions.changeCellType({ cellType, side }));
  };

  const handleToggleGimmick = () => {
    const newIsOn = !isGimmickFlipOn;
    setIsGimmickFlipOn(newIsOn);
    const side = newIsOn ? "front" : GRID_CELL_TYPES[selectedCellType].defaultSide;
    dispatch(cellTypeSlice.actions.changeCellType({ cellType: selectedCellType, side }));
  };

  return (
    <Card className="w-full min-w-[120px] max-w-[300px] bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      <div className="px-4 pb-2 flex items-center gap-2">
        <span className="text-sm">ギミック反転</span>
        <Button
          variant={isGimmickFlipOn ? "default" : "outline"}
          size="sm"
          onClick={handleToggleGimmick}
        >
          {isGimmickFlipOn ? "ON" : "OFF"}
        </Button>
      </div>
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
