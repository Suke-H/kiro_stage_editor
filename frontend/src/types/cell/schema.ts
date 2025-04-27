import { CELL_TYPES, CELL_DEFINITIONS } from './constants';

export type CellType           = keyof typeof CELL_TYPES;
export type CellDefinitionKey  = keyof typeof CELL_DEFINITIONS;

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
