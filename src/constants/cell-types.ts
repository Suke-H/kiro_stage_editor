import { CellType, CellTypeConfig } from '../components/types';

export const CELL_TYPES: Record<CellType, CellTypeConfig> = {
  'white': { label: '白', color: 'bg-white' },
  'black': { label: '黒', color: 'bg-black' },
  'start': { label: '開始', color: 'bg-green-500' },
  'goal': { label: 'ゴール', color: 'bg-blue-500' },
  'obstacle': { label: '障害物', color: 'bg-red-500' },
};