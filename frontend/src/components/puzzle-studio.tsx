import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { studioModeSlice }  from "../store/slices/studio-mode-slice";
import { StudioMode } from "../components/types";

import EditorPage from "@/components/editor-page";
import PlayPage from "./play-page";
import SolverPage from "./solver-page";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PuzzleStudio: React.FC = () => {
  const dispatch = useDispatch();
  const studioMode = useSelector((state: RootState) => state.studioMode.mode);

  const handleStudioModeSwitch = (mode: string) => {
    dispatch(studioModeSlice.actions.switchMode(mode as StudioMode));
  }

  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
      <Tabs value={studioMode} onValueChange={handleStudioModeSwitch} className="w-full">

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
