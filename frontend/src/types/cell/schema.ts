// import { CELL_TYPES }  from './constants';
import  { CellTypeKey } from './constants';

// export type CellType           = keyof typeof CELL_TYPES;
export type CellType           = CellTypeKey;

export interface CellTypeInfo {
  label:     string;
  color:     string;
  code:      string;
  imagePath: string;
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
