import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { gridSlice } from '../store/slices/grid-slice';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';

const PlayPage: React.FC = () => {
  const dispatch = useDispatch();

  // 毎回プレイモード起動時に、グリッド履歴をクリアする
  // (課題)エディタ切替時も、操作をリセットする必要がある
  // // （clearHistory:履歴を空に、reset:履歴を空に・グリッドを最初の状態に）
  useEffect(() => {
    dispatch(gridSlice.actions.clearHistory());
  }, [dispatch]);

  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen">
      <div className="flex gap-4">
        <Grid />
        <PanelList />
      </div>
    </div>
  );
};

export default PlayPage;