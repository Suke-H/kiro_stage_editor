import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import EditorPage from "@/components/editor-page";
import PlayPage from "./play-page";
import SolverPage from "./solver-page";

import { gridSlice } from "../store/slices/grid-slice";
import { panelListSlice } from "../store/slices/panel-list-slice";

import { decodeStageFromUrl } from "../utils/url";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PuzzleStudio: React.FC = () => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("editor");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cells = params.get("cells");
    const panels = params.get("panels");
    if (cells && panels) {
      const stageData = `cells=${cells}&panels=${panels}`;
      const parsedData = decodeStageFromUrl(stageData);
      dispatch(gridSlice.actions.loadGrid(parsedData.cells));
      dispatch(panelListSlice.actions.loadPanels(parsedData.panels));
    }
  }, []);

  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
      <Tabs value={mode} onValueChange={setMode} className="w-full">

        <TabsList className="grid w-full grid-cols-3 bg-[#DAE0EA]">
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
    </div>
  );
};

export default PuzzleStudio;
