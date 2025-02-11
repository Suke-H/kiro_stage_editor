import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { gridSlice } from '../store/slices/grid-slice';
import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';

const PlayPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(gridSlice.actions.clearHistory());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-4 min-h-screen">
      <div className="flex gap-4 flex-col md:flex-row">
        <Grid />
        <PanelList />
      </div>
    </div>
  );
};

export default PlayPage;
