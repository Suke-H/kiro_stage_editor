import { CellType, CellTypeConfig } from '../components/types';

export const CELL_TYPES: Record<CellType, CellTypeConfig> = {
  'Empty': { label: '空', color: 'bg-white', code: 'e' },
  'White': { label: '白', color: 'bg-white', code: 'w' },
  'Black': { label: '黒', color: 'bg-black', code: 'b' },
  'Start': { label: '開始', color: 'bg-green-500', code: 's' },
  'Goal': { label: 'ゴール', color: 'bg-blue-500', code: 'g' },
  'DummyGoal': { label: 'ダミーゴール', color: 'bg-red-500', code: 'd' },
  'Crow': { label: 'カラス', color: 'bg-yellow-500', code: 'c' },
  'ArrowUp': { label: '矢印↑', color: 'bg-white', code: 'au' },
  'ArrowDown': { label: '矢印↓', color: 'bg-white', code: 'ad' },
  'ArrowLeft': { label: '矢印←', color: 'bg-white', code: 'al' },
  'ArrowRight': { label: '矢印→', color: 'bg-white', code: 'ar' },
  'Obstacle': { label: '障害物', color: 'bg-gray-500', code: 'o' },
};