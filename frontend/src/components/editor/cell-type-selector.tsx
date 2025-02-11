import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CellDefinitions } from "../types";
import { CELL_DEFINITIONS } from "../../constants/cell-types";
import { changeCellType } from "../../store/slices/cell-type-slice";
import { RootState } from "../../store";

export const CellTypeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedCellType = useSelector(
    (state: RootState) => state.cellType.selectedCellType
  );

  return (
    <Card className="w-full min-w-[120px] max-w-[300px] bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      {/* 画面幅に応じてコラムの数を変更 */}
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {(Object.keys(CELL_DEFINITIONS) as CellDefinitions[]).map((type) => (
          <Button
            key={type}
            variant={selectedCellType === type ? "default" : "outline"}
            className={`w-full ${CELL_DEFINITIONS[type].color} ${
              CELL_DEFINITIONS[type].color === "bg-white"
                ? "text-black"
                : "text-white"
            } truncate`}
            onClick={() => dispatch(changeCellType(type))}
          >
            {CELL_DEFINITIONS[type].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
