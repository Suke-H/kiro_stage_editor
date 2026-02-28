import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { gridSlice } from '@/store/slices/grid-slice';
import { panelListSlice } from '@/store/slices/panel-list-slice';

import { Button } from "@/components/ui/button";
import { Download, Upload, Link, Save } from "lucide-react";
import { exportStageToYaml, importStageFromYaml } from "../../../utils/yaml";
import { shareStageUrl } from "../../../utils/url";
import { saveStageToLocalStorage } from "../../../utils/local-storage";
import { toast } from "sonner";

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

  const handleImportStageFromYaml = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await importStageFromYaml(event);
    if (result) {
      const [grid, trimmedPanels] = result;
      dispatch(gridSlice.actions.loadGrid(grid));
      dispatch(panelListSlice.actions.loadPanels(trimmedPanels));
    }
  };

  const handleSaveToLocalStorage = () => {
    try {
      saveStageToLocalStorage(grid, panels);
      toast.success("端末に保存しました！");
    } catch (error) {
      toast.error("保存に失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-8">
      {/* 端末に保存ボタン */}
      <Button
        onClick={handleSaveToLocalStorage}
        className="flex items-center gap-2 w-40 bg-green-600 hover:bg-green-700"
      >
        <Save size={16} /> 端末に保存
      </Button>

      {/* YAML、URL */}
      <Button
        onClick={() => exportStageToYaml(grid, panels)}
        className="flex items-center gap-2 w-40"
      >
        <Upload size={16} /> YAMLエクスポート
      </Button>
      <input
        type="file"
        accept=".yaml,.yml"
        onChange={handleImportStageFromYaml}
        className="hidden"
        id="yamlImport"
      />

      <label htmlFor="yamlImport" className="cursor-pointer">
        <Button
          onClick={triggerFileInput}
          variant="outline"
          className="flex items-center gap-2 w-40 text-left"
        >
          <Download size={16} /> YAMLインポート
        </Button>
      </label>
      <Button
        onClick={() => shareStageUrl(grid, panels)}
        className="flex items-center gap-2 w-40 bg-white text-black"
      >
        <Link size={16} /> URLを生成
      </Button>
    </div>
  );
};