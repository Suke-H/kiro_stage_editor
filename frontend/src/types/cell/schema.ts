import  { PanelCellTypeKey } from './constants';

export type PanelCellType           = PanelCellTypeKey;

export interface CellTypeInfo {
  code:      string;
}

export type CellSideInfo       = {
  code:    string;
  picture: string;
};

export type CellDefinition     = {
  label:   string;
  color:   string;
  neutral?: CellSideInfo;
  front?:   CellSideInfo;
  back?:    CellSideInfo;
};
