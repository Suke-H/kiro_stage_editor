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
    <Card className="w-full max-w-32 mx-auto bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
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
