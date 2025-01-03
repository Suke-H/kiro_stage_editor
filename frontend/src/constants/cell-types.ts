import { CellType, CellTypeConfig } from '../components/types';

export const CELL_TYPES: Record<CellType, CellTypeConfig> = {
  'empty': { label: '空', color: 'bg-white', code: 'e' },
  'white': { label: '白', color: 'bg-white', code: 'w' },
  'black': { label: '黒', color: 'bg-black', code: 'b' },
  'start': { label: '開始', color: 'bg-green-500', code: 's' },
  'goal': { label: 'ゴール', color: 'bg-blue-500', code: 'g' },
  'dummy-goal': { label: 'ダミーゴール', color: 'bg-red-500', code: 'd' },
  'crow': { label: 'カラス', color: 'bg-yellow-500', code: 'c' },
  'arrow-up': { label: '矢印↑', color: 'bg-white', code: 'au' },
  'arrow-down': { label: '矢印↓', color: 'bg-white', code: 'ad' },
  'arrow-left': { label: '矢印←', color: 'bg-white', code: 'al' },
  'arrow-right': { label: '矢印→', color: 'bg-white', code: 'ar' },
  'obstacle': { label: '障害物', color: 'bg-gray-500', code: 'o' },
};