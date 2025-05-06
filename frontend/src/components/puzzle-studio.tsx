import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../store";
import { gridSlice } from '../store/slices/grid-slice';
import { panelListSlice } from '../store/slices/panel-list-slice';
import { studioModeSlice }  from "../store/slices/studio-mode-slice";

import { StudioMode } from "../types/store";

import EditorPage from "@/components/editor-page";
import PlayPage from "./play-page";
import SolverPage from "./solver-page";
import { decodeStageFromUrl } from '../utils/url';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PuzzleStudio: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector((state: RootState) => state.studioMode.studioMode);

  // FastAPIの疎通確認
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API疎通確認成功:', data);
      } catch (error) {
        console.error('API疎通確認エラー:', error);
      }
    };
    checkApiConnection();
  }, []);

  // URLからステージをロード & studioMode の設定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cells = params.get('cells');
    const panels = params.get('panels');
    const modeParam = params.get('mode');

    // URLの `mode` を `StudioMode` に対応させる
    const mode = Object.values(StudioMode).includes(modeParam as StudioMode)
      ? (modeParam as StudioMode)
      : StudioMode.Editor; // デフォルトは Editor

    dispatch(studioModeSlice.actions.switchMode(mode));

    if (cells && panels) {
      const stageData = `cells=${cells}&panels=${panels}`;
      const parsedData = decodeStageFromUrl(stageData);
      dispatch(gridSlice.actions.loadGrid(parsedData.cells));
      dispatch(panelListSlice.actions.loadPanels(parsedData.panels));
    }
  }, [dispatch]);

  const handleStudioModeSwitch = (mode: string) => {
    dispatch(studioModeSlice.actions.switchMode(mode as StudioMode));
  }

  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen">
      <Tabs value={studioMode} onValueChange={handleStudioModeSwitch} className="w-full">

        <TabsList className="grid max-w-[1389px] grid-cols-3 justify-start">
          <TabsTrigger value="editor" className="data-[state=active]:bg-[#B3B9D1]" >
            Editor
          </TabsTrigger>
          <TabsTrigger value="play" className="data-[state=active]:bg-[#B3B9D1]">
            Play
          </TabsTrigger>
          <TabsTrigger value="solver" className="data-[state=active]:bg-[#B3B9D1]">
            Solver
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <EditorPage />
        </TabsContent>

        <TabsContent value="play">
          <PlayPage />
        </TabsContent>

        <TabsContent value="solver">
          <SolverPage />
        </TabsContent>

      </Tabs>

      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        <p>
          <a 
            href="https://github.com/Suke-H/kiro_stage_editor" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            GitHub Repository
          </a>
        </p>
        <p>© 2025 みちくさ</p>
      </footer>

    </div>
  );
};

export default PuzzleStudio;
