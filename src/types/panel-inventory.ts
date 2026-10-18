import { Panel } from '@/types/panel';

export interface RemovedPanel {
  panel: Panel;
  index: number;
  isCollected: boolean;
}

export interface PanelInventory {
  panels: Panel[];
  removedPanels: RemovedPanel[];
}
