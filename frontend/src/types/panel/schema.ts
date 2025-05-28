import { Vector } from '@/types/path';
import { GridCell } from '@/types/grid';

export type PanelCellTypeKey = "White" | "Black" | "Flag" | "Cut" | "CopyWhite" | "CopyBlack";

export interface Panel {
  id: string;
  cells: PanelCellTypeKey[][];
  type?: "Normal" | "Cut" | "Paste" | "Flag";
}

export type CopyPanel = Omit<Panel, "cells"> & {
  cells: GridCell[][];
};

export type PanelPlacement = {
  panel: Panel;
  highlight: Vector; // パネル内座標
  point: Vector;     // 盤面座標
};