import { CellType, CellTypeConfig } from '../components/types';

export const CELL_TYPES: Record<CellType, CellTypeConfig> = {
  'white': { label: '白', color: 'bg-white', code: 'w' },
  'black': { label: '黒', color: 'bg-black', code: 'b' },
  'start': { label: '開始', color: 'bg-green-500', code: 's' },
  'goal': { label: 'ゴール', color: 'bg-blue-500', code: 'g' },
  'obstacle': { label: '障害物', color: 'bg-red-500', code: 'o' },
};