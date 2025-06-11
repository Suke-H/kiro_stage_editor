import { PanelCellTypeKey } from "./schema";

export type PanelCellInfo = {
  code: string;
  picture: string;
};

export const PANEL_CELL_TYPES: Record<PanelCellTypeKey, PanelCellInfo> = {
  White: {
    code: "w",
    picture: "white.png", 
  },
  Black: {
    code: "b",
    picture: "black.png", 
  },
  Flag: {
    code: "f",
    picture: "flag.png", 
  },
  Cut: {
    code: "c",
    picture: "black.png",
  },
  CopyWhite: {
    code: "cw",
    picture: "white.png",
  },
  CopyBlack: {
    code: "cb",
    picture: "black.png",
  },

} as const;
