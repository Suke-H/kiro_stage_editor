import { PanelCellTypeKey } from "./schema";

export interface PanelCellTypeKeyInfo {
  code: string;
}

export const PANEL_CELL_TYPES: Record<PanelCellTypeKey, PanelCellTypeKeyInfo> =
  {
    White: { code: "w" },
    Black: { code: "b" },
  } as const;
