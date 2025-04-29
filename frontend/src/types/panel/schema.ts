export type PanelCellTypeKey = "White" | "Black";

export interface Panel {
  id: string;
  cells: PanelCellTypeKey[][];
}
