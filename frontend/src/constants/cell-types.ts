import { CellType, CellTypeConfig } from '../components/types';

export const CELL_TYPES: Record<CellType, CellTypeConfig> = {
  'empty': { label: '空', color: '', code: 'e' },
  'white': { label: '白', color: 'bg-white', code: 'w' },
  'black': { label: '黒', color: 'bg-black', code: 'b' },
  'start': { label: '開始', color: 'bg-green-500', code: 's' },
  'goal': { label: 'ゴール', color: 'bg-blue-500', code: 'g' },
  'dummy-goal': { label: 'ダミーゴール', color: 'bg-red-500', code: 'd' },
  'crow': { label: 'カラス', color: 'bg-yellow-500', code: 'c' },
};