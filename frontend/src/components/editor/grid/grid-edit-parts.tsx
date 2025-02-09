import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { gridSlice } from "../../../store/slices/grid-slice";

import { Button } from "@/components/ui/button";
import { Download, Upload, Link } from "lucide-react";
import { Add, Remove } from "@mui/icons-material";
import { exportStageToYaml, importStageFromYaml } from "../../../utils/yaml";
import { shareStageUrl } from "../../../utils/url";
// import { cellTypeSlice } from "../../store/slices/cell-type-slice";

export const GridEditorParts: React.FC = () => {
  const dispatch = useDispatch();
  const grid = useSelector((state: RootState) => state.grid.grid);
  const panels = useSelector((state: RootState) => state.panelList.panels);

  const triggerFileInput = () => {
    const input = document.getElementById("yamlImport") as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

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

      <div className="flex gap-2 mt-4">
        {/* YAML、URL */}
        <Button
          onClick={() => exportStageToYaml(grid, panels)}
          className="flex items-center gap-2"
        >
          <Download size={16} /> YAMLエクスポート
        </Button>
        <input
          type="file"
          accept=".yaml,.yml"
          onChange={(event) => importStageFromYaml(event, dispatch)}
          className="hidden"
          id="yamlImport"
        />
        <label htmlFor="yamlImport" className="cursor-pointer">
          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload size={16} /> YAMLインポート
          </Button>
        </label>
        <Button
          onClick={() => shareStageUrl(grid, panels)}
          className="mt-4 flex items-center gap-2"
        >
          <Link size={16} /> URLを生成
        </Button>
      </div>
    </div>

  );
};
