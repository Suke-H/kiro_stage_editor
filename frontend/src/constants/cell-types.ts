export const CELL_TYPES = {
  Empty: { label: '空', color: 'bg-white', code: 'e', imagePath: '/cells/empty.png' },
  White: { label: '白', color: 'bg-white', code: 'w', imagePath: '/cells/white.png' },
  Black: { label: '黒', color: 'bg-black', code: 'b', imagePath: '/cells/black.png' },
  Start: { label: '開始', color: 'bg-green-500', code: 's', imagePath: '/cells/start.png' },
  Goal: { label: 'ゴール', color: 'bg-blue-500', code: 'g', imagePath: '/cells/goal.png' },
  DummyGoal: { label: 'ダミーゴール', color: 'bg-red-500', code: 'd', imagePath: '/cells/dummy-goal.png' },
  Crow: { label: 'カラス', color: 'bg-yellow-500', code: 'c', imagePath: '/cells/crow.png' },
  ArrowUp: { label: '矢印↑', color: 'bg-white', code: 'au', imagePath: '/cells/arrow-up.png' },
  ArrowDown: { label: '矢印↓', color: 'bg-white', code: 'ad', imagePath: '/cells/arrow-down.png' },
  ArrowLeft: { label: '矢印←', color: 'bg-white', code: 'al', imagePath: '/cells/arrow-left.png' },
  ArrowRight: { label: '矢印→', color: 'bg-white', code: 'ar', imagePath: '/cells/arrow-right.png' },
} as const;

// キーから動的に型を生成
export type CellType = keyof typeof CELL_TYPES;