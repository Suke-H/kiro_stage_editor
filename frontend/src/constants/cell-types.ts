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
// export type CellType = 'Empty' | 'White' | 'Black' | 'Start' | 'Goal' | 'DummyGoal' | 'Crow' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Normal';

// セルの状態を表す型
export type CellSideInfo = {
  code: string;
  picture: string;
};

// セルの定義を表す型
export type CellDefinition = {
  label: string;
  color: string;
  neutral?: CellSideInfo;
  front?: CellSideInfo;
  back?: CellSideInfo;
};

// セルの種類を定義
export const CELL_DEFINITIONS: Record<string, CellDefinition> = {
  Flip: {
    label: '反転',
    color: 'bg-black',
  },
  Empty: {
    label: '空',
    color: 'bg-white',
    neutral: {
      code: 'e',
      picture: 'empty.png'
    }
  },
  Normal: {
    label: '通常床',
    color: 'bg-[#DAE0EA]',
    front: {
      code: 'N',
      picture: 'white.png'
    },
    back: {
      code: 'n',
      picture: 'black.png'
    }
  },
  Start: {
    label: 'スタート',
    color: 'bg-green-500',
    neutral: {
      code: 's',
      picture: 'start.png'
    }
  },
  Goal: {
    label: 'ゴール',
    color: 'bg-blue-500',
    neutral: {
      code: 'g',
      picture: 'goal.png'
    }
  },
  DummyGoal: {
    label: 'ダミーゴール',
    color: 'bg-red-500',
    neutral: {
      code: 'd',
      picture: 'dummy-goal.png'
    }
  }
} as const;

export type CellDefinitions = keyof typeof CELL_DEFINITIONS;
