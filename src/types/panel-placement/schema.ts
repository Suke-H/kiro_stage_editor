import { Vector } from '../path';
import { Panel, CopyPanel } from '../panel';
import { Grid } from '../grid';

export type PanelPlacement = {
  panel: Panel | CopyPanel;
  highlight: Vector; // パネル内座標
  point: Vector;     // 盤面座標
};

export interface PhaseGrids {
  before: Grid;  // パネル配置前のグリッド
  after: Grid;   // パネル配置後のグリッド
}

export interface PhasedSolution {
  phases: PanelPlacement[][];
  phaseHistory: Grid[];           // 既存（配置前のみ）
  phaseGrids: PhaseGrids[];      // 新規（配置前後両方）
}