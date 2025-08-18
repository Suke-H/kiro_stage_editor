import { Vector } from '../path';
import { Panel } from '../panel';
import { Grid } from '../grid';

export type PanelPlacement = {
  panel: Panel;
  highlight: Vector; // パネル内座標
  point: Vector;     // 盤面座標
};

export interface PhasedSolution {
  phases: PanelPlacement[][];
  phaseHistory: Grid[];
}