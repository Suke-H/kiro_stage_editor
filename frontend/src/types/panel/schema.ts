import { Vector } from '@/types/path';

export type PanelCellTypeKey = "White" | "Black" | "Flag";

export interface Panel {
  id: string;
  cells: PanelCellTypeKey[][];
}

export type PanelPlacement = {
  panel: Panel;
  highlight: Vector; // パネル内座標
  point: Vector;     // 盤面座標
};