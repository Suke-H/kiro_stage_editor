import { useState } from "react";
import { useDispatch } from "react-redux";
import { gridSlice } from "../../../store/slices/grid-slice";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Add, Remove } from "@mui/icons-material";

export const MatrixOperationPart: React.FC = () => {
  const [isFirst, setIsFirst] = useState(false);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* 行・列操作 */}
      <div className="grid grid-cols-2 gap-4 text-left">
        {/* 行 */}
        <div>
          <span className="font-semibold text-lg ml-2.5">行</span>
          <div className="flex justify-center gap-2 mt-2">
            <Button
              onClick={() => dispatch(gridSlice.actions.addToRow({ isFirst }))}
              className="flex items-center justify-center w-10 h-10"
            >
              <Add />
            </Button>
            <Button
              onClick={() => dispatch(gridSlice.actions.removeFromRow({ isFirst }))}
              className="flex items-center justify-center w-10 h-10"
            >
              <Remove />
            </Button>
          </div>
        </div>
        {/* 列 */}
        <div>
          <span className="font-semibold text-lg ml-2.5">列</span>
          <div className="flex justify-center gap-2 mt-2">
            <Button
              onClick={() => dispatch(gridSlice.actions.addToCol({ isFirst }))}
              className="flex items-center justify-center w-10 h-10"
            >
              <Add />
            </Button>
            <Button
              onClick={() => dispatch(gridSlice.actions.removeFromCol({ isFirst }))}
              className="flex items-center justify-center w-10 h-10"
            >
              <Remove />
            </Button>
          </div>
        </div>
      </div>

      {/* トグルボタン */}
      <div className="flex justify-left items-center gap-2">
        <Switch checked={!isFirst} onCheckedChange={() => setIsFirst(!isFirst)} />
        <span>{isFirst ? "先頭の行/列を操作" : "末尾の行/列を操作"}</span>
      </div>
    </div>
  );
};
