import { Vector } from '../path';
import { Panel } from '../panel';

export type PanelPlacement = {
  panel: Panel;
  highlight: Vector; // パネル内座標
  point: Vector;     // 盤面座標
};