import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { gridSlice } from "../store/slices/grid-slice";
import { panelListSlice } from "../store/slices/panel-list-slice";

import { GridViewer } from "@/components/editor/grid-viewer";
import { PanelList } from "@/components/editor/panel-list";

// Editor->Play移行時に、Playモード時のパネル配置をリセット
const PlayPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(gridSlice.actions.reset());
    dispatch(panelListSlice.actions.reset());

    // 最後に履歴を完全クリア
    dispatch(gridSlice.actions.clearHistory());
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
