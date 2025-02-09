import { Grid } from '@/components/editor/grid';
import { PanelList } from '@/components/editor/panel-list';

const PlayPage: React.FC = () => {
  return (
    <div className="flex flex-col p-4 gap-4 min-h-screen bg-[#DAE0EA]">
      <div className="flex gap-4">
        <Grid />
        <PanelList />
      </div>
    </div>
  );
};

export default PlayPage;