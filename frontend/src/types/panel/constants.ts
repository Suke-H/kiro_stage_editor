import { CellType } from './schema';

export interface CellTypeInfo {
  code:      string;
}

export const CELL_TYPES: Record<CellType, CellTypeInfo> = {
  White:      { code: 'w' },
  Black:      { code: 'b' },
} as const;