import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { gridSlice } from "@/store/slices/grid-slice";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { clearMoveTarget } from "@/store/slices/move-slice";
import { clearSwapTarget } from "@/store/slices/swap-slice";

import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";

const PlayPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(gridSlice.actions.reset());
    dispatch(gridSlice.actions.resetPhase());
    dispatch(panelListSlice.actions.reset());
    dispatch(clearSwapTarget());
    dispatch(clearMoveTarget());

    dispatch(gridSlice.actions.initHistory());
    dispatch(gridSlice.actions.initPhaseHistory());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-4 min-h-screen">
      <div className="flex gap-4 flex-col md:flex-row">
        <GridViewer />
        <PanelList />
      </div>
    </div>
  );
};

export default PlayPage;
