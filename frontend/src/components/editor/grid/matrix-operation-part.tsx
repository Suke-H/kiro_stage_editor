import { useDispatch } from "react-redux";
import { gridSlice } from "../../../store/slices/grid-slice";

import { Button } from "@/components/ui/button";
import { Add, Remove } from "@mui/icons-material";

export const MatrixOperationPart: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <div className="flex flex-col gap-4 mt-4">
        {/* 行操作 */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-lg">行</span>
          <div className="flex gap-4">
            {/* 行 先頭 */}
            <div className="flex items-center gap-2">
              <span>先頭</span>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.addToRow({ isFirst: true }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Add />
              </Button>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.removeFromRow({ isFirst: true }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Remove />
              </Button>
            </div>
            {/* 行 末尾 */}
            <div className="flex items-center gap-2">
              <span>末尾</span>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.addToRow({ isFirst: false }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Add />
              </Button>
              <Button
                onClick={() =>
                  dispatch(
                    gridSlice.actions.removeFromRow({ isFirst: false })
                  )
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Remove />
              </Button>
            </div>
          </div>
        </div>

        {/* 列操作 */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-lg">列</span>
          <div className="flex gap-4">
            {/* 列 先頭 */}
            <div className="flex items-center gap-2">
              <span>先頭</span>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.addToCol({ isFirst: true }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Add />
              </Button>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.removeFromCol({ isFirst: true }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Remove />
              </Button>
            </div>
            {/* 列 末尾 */}
            <div className="flex items-center gap-2">
              <span>末尾</span>
              <Button
                onClick={() =>
                  dispatch(gridSlice.actions.addToCol({ isFirst: false }))
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Add />
              </Button>
              <Button
                onClick={() =>
                  dispatch(
                    gridSlice.actions.removeFromCol({ isFirst: false })
                  )
                }
                className="flex items-center justify-center w-10 h-10"
              >
                <Remove />
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>

  );
};
