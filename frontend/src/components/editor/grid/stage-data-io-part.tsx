import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";

import { Button } from "@/components/ui/button";
import { Download, Upload, Link } from "lucide-react";
import { exportStageToYaml, importStageFromYaml } from "../../../utils/yaml";
import { shareStageUrl } from "../../../utils/url";
// import { cellTypeSlice } from "../../store/slices/cell-type-slice";

export const StageDataIOPart: React.FC = () => {
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

  );
};
