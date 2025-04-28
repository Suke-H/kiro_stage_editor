import type { CellDefinition, CellTypeInfo } from './schema';

export type CellTypeKey =
  | 'Empty' 
  | 'White' 
  | 'Black' 
  | 'Start' 
  | 'Goal'
  | 'DummyGoal' 
  | 'Crow' 
  | 'ArrowUp' 
  | 'ArrowDown'
  | 'ArrowLeft' 
  | 'ArrowRight';

export const CELL_TYPES: Record<CellTypeKey, CellTypeInfo> = {
  Empty:      { label: '空',         color: 'bg-white',      code: 'e',  imagePath: '/cells/empty.png' },
  White:      { label: '白',         color: 'bg-white',      code: 'w',  imagePath: '/cells/white.png' },
  Black:      { label: '黒',         color: 'bg-black',      code: 'b',  imagePath: '/cells/black.png' },
  Start:      { label: '開始',       color: 'bg-green-500',  code: 's',  imagePath: '/cells/start.png' },
  Goal:       { label: 'ゴール',     color: 'bg-blue-500',   code: 'g',  imagePath: '/cells/goal.png' },
  DummyGoal:  { label: 'ダミーゴール', color: 'bg-red-500',   code: 'd',  imagePath: '/cells/dummy-goal.png' },
  Crow:       { label: 'カラス',     color: 'bg-yellow-500', code: 'c',  imagePath: '/cells/crow.png' },
  ArrowUp:    { label: '矢印↑',      color: 'bg-white',      code: 'au', imagePath: '/cells/arrow-up.png' },
  ArrowDown:  { label: '矢印↓',      color: 'bg-white',      code: 'ad', imagePath: '/cells/arrow-down.png' },
  ArrowLeft:  { label: '矢印←',      color: 'bg-white',      code: 'al', imagePath: '/cells/arrow-left.png' },
  ArrowRight: { label: '矢印→',      color: 'bg-white',      code: 'ar', imagePath: '/cells/arrow-right.png' },
} as const;

export type CellDefinitionKey =
  | 'Flip'
  | 'Empty'
  | 'Normal'
  | 'Start'
  | 'Goal'
  | 'DummyGoal'
  | 'Crow'
  | 'Wolf'
  | 'Warp'
  | 'ArrowUpDown'
  | 'ArrowRightLeft'
  | 'Rest';

export const CELL_DEFINITIONS: Record<CellDefinitionKey, CellDefinition> = {
  Flip:       { label: '反転',    color: 'bg-black' },
  Empty:      { label: '空',      color: 'bg-white',   neutral: { code: 'e', picture: 'empty.png' } },
  Normal:     { label: '通常床',  color: 'bg-[#DAE0EA]', front: { code: 'w', picture: 'white.png' }, back: { code: 'b', picture: 'black.png' } },
  Start:      { label: 'スタート', color: 'bg-green-500', neutral: { code: 's', picture: 'start.png' } },
  Goal:       { label: 'ゴール',   color: 'bg-blue-500',  neutral: { code: 'g', picture: 'goal.png' } },
  DummyGoal:  { label: 'ダミーゴール', color: 'bg-red-500', neutral: { code: 'd', picture: 'dummy-goal.png' } },
  Crow:       { label: 'カラス',    color: 'bg-yellow-500', front: { code: 'c', picture: 'crow.png' }, back: { code: 'C', picture: 'black.png' } },
  Wolf:       { label: 'オオカミ',  color: 'bg-gray-500',   neutral: { code: 'o', picture: 'wolf.png' } },
  Warp:       { label: 'ワープ',    color: 'bg-purple-500', front: { code: 't', picture: 'warp-white.png' }, back: { code: 'T', picture: 'warp-black.png' } },
  ArrowUpDown:{ label: '矢印↑↓',   color: 'bg-white',      front: { code: 'au', picture: 'arrow-up.png' }, back: { code: 'ad', picture: 'arrow-down.png' } },
  ArrowRightLeft:{ label: '矢印→←', color: 'bg-white',      front: { code: 'ar', picture: 'arrow-right.png' }, back: { code: 'al', picture: 'arrow-left.png' } },
  Rest:       { label: '休憩',      color: 'bg-yellow-500', neutral: { code: 'r', picture: 'rest.png' } },
} as const;
