import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';
import { NewPanelCreator } from '@/components/editor/new-panel-creator';

const PlayPage: React.FC = () => {
  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
      <div className="flex gap-4">
        <Grid />
      </div>
  
      <div className="flex gap-4">
        <PanelList />
        <NewPanelCreator />
      </div>
    </div>
  );
};

export default PlayPage;