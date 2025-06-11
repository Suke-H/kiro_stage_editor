import { Grid, GridCell } from '@/types/grid';

// Python版のCHARMAPをTypeScript版に移植
export const CHARMAP: Record<string, { type: string; side: string }> = {
  'S': { type: 'Start', side: 'neutral' },
  'G': { type: 'Goal', side: 'neutral' },
  'D': { type: 'DummyGoal', side: 'neutral' },
  'C': { type: 'Crow', side: 'neutral' },
  'R': { type: 'Rest', side: 'neutral' },
  '#': { type: 'Empty', side: 'neutral' },
  '.': { type: 'Normal', side: 'front' },
  'x': { type: 'Normal', side: 'back' },
};

/**
 * 文字列配列からGridを生成（Python版のgrid_fromと同等）
 */
export const gridFrom = (lines: string[]): Grid => {
  const rows: GridCell[][] = [];
  for (const line of lines) {
    const row: GridCell[] = [];
    for (const char of line) {
      const cellInfo = CHARMAP[char];
      if (!cellInfo) {
        throw new Error(`Unknown character: ${char}`);
      }
      row.push({
        type: cellInfo.type as GridCell['type'],
        side: cellInfo.side as GridCell['side']
      });
    }
    rows.push(row);
  }
  return rows;
}

/**
 * テストケースのタイプ定義
 */
export interface TestCase {
  id: string;
  lines: string[];
  expectedResult: string;
  expectedDummy: boolean;
  expectedCrows: number;
}

/**
 * Python版grid_test_casesの完全移植（26ケース）
 */
export const TEST_CASES: TestCase[] = [
  // 1) ギミックなし：ゴール（クリア）
  {
    id: '01_no_gimmick_goal',
    lines: [
      '###G#',
      '#xx..',
      '#x.x.',
      'S.x..',
      '#...#'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 2) ギミックなし：道がない
  {
    id: '02_no_gimmick_no_path',
    lines: [
      '###G#',
      '#.x..',
      '#x.x.',
      'S.xx.',
      '#...#'
    ],
    expectedResult: 'NoPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 3) ダミーゴールあり：本物ゴールが近い（クリア）
  {
    id: '03_dummy_near_real_goal',
    lines: [
      '.....G',
      '.x..xx',
      'DxS..#'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 4) ダミーゴールあり：ダミーゴールが近い
  {
    id: '04_dummy_near_dummy_goal',
    lines: [
      '.....G',
      '....xx',
      'D.S..#'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 0
  },

  // 5) ダミーゴールあり：同じ長さ（クリア）
  {
    id: '05_dummy_equal_length',
    lines: [
      'S..',
      '.xG',
      '.D.'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 6) カラス：通る（クリア）
  {
    id: '06_crow_get',
    lines: [
      'C....',
      '.xx.G',
      '..#x.',
      '#.Sx#'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 1
  },

  // 7) カラス：通らない
  {
    id: '07_crow_skip',
    lines: [
      'C....',
      '....G',
      '..#..',
      '#.S.#'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 8) カラス：通って、ゴール
  {
    id: '08_crow_get_and_real_goal',
    lines: [
      'C.G',
      '...',
      'S..'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 1
  },

  // 9) カラス：通らないで、ダミーゴール
  {
    id: '09_crow_skip_and_dummy_goal',
    lines: [
      'C.D',
      '...',
      'S.G'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 0
  },

  // 10) カラス：通って、ダミーゴール
  {
    id: '10_crow_get_and_dummy_goal',
    lines: [
      'S.C',
      '...',
      'G.D'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 1
  },

  // 11) マルチカラス：全取得してゴール
  {
    id: '11_multi_crow_all_get_and_goal',
    lines: [
      'C.SxG',
      '.xxC.',
      '....x'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 2
  },

  // 12) マルチカラス：何も取らずゴール（本物）
  {
    id: '12_multi_crow_none_get_and_real_goal',
    lines: [
      'C.S.G',
      '...C.',
      '.....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 13) マルチカラス：1個取ってゴール（本物）
  {
    id: '13_multi_crow_one_get_and_real_goal',
    lines: [
      'C.SxG',
      '..xC.',
      '.....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: false,
    expectedCrows: 1
  },

  // 14) マルチカラス：何も取らずダミーゴール
  {
    id: '14_multi_crow_none_get_and_dummy_goal',
    lines: [
      'G....',
      '.xxx.',
      'DxCxC',
      '.xxx.',
      'S....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 0
  },

  // 15) マルチカラス：1個取ってダミーゴール
  {
    id: '15_multi_crow_one_get_and_dummy_goal',
    lines: [
      'G....',
      '.xxx.',
      'D.CxC',
      'xx.x.',
      'S....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 1
  },

  // 16) マルチカラス：全取得してダミーゴール
  {
    id: '16_multi_crow_all_get_and_dummy_goal',
    lines: [
      'G....',
      '.xxx.',
      'D.C.C',
      'xxxx.',
      'S....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 2
  },

  // 17) マルチカラス：全取得してゴール（本物）
  {
    id: '17_multi_crow_all_get_and_real_goal',
    lines: [
      'G....',
      'xx.xx',
      'DxC.C',
      'xxxx.',
      'S....'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 2
  },

  // 18) マルチカラス：1個取ってゴール（本物）
  {
    id: '18_multi_crow_one_get_and_real_goal',
    lines: [
      'G....',
      '.xxx.',
      'DxCxC',
      'xxxx.',
      'S....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: false,
    expectedCrows: 1
  },

  // 19) マルチダミーゴール：本物ゴール近い
  {
    id: '19_multi_dummy_goal_near_real_goal',
    lines: [
      'D.xx.',
      '#.x..',
      '#..GD',
      'S....'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 20) マルチダミーゴール：ダミーゴール近い
  {
    id: '20_multi_dummy_goal_near_dummy_goal',
    lines: [
      'D.xx.',
      '#.x..',
      '#..DG',
      'S....'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 0
  },

  // 21) マルチダミーゴール：同距離
  {
    id: '21_multi_dummy_goal_equal_length',
    lines: [
      'D.xxD',
      '#.x..',
      '#...G',
      'S....'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 22) マルチダミーゴール：カラス取って本物ゴール
  {
    id: '22_multi_dummy_goal_get_crow_and_real_goal',
    lines: [
      'Dx...',
      '#C.x.',
      '#.xDG',
      'S.x..'
    ],
    expectedResult: 'HasClearPath',
    expectedDummy: false,
    expectedCrows: 1
  },

  // 23) マルチダミーゴール：カラス取ってダミーゴール
  {
    id: '23_multi_dummy_goal_get_crow_and_dummy_goal',
    lines: [
      'S.C...G',
      '.......',
      '..D.D..'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 1
  },

  // 24) マルチダミーゴール：カラス選択でダミーゴール
  {
    id: '24_multi_dummy_goal_choose_crow_dummy_goal',
    lines: [
      'S....G',
      '......',
      '.CD..D'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 1
  },

  // 25) マルチダミーゴール：カラス無視で本物ゴール
  {
    id: '25_multi_dummy_goal_skip_crow_and_real_goal',
    lines: [
      'S.....G',
      '.......',
      '..CD.D.'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: false,
    expectedCrows: 0
  },

  // 26) マルチダミーゴール：カラス無視でダミーゴール
  {
    id: '26_multi_dummy_goal_skip_crow_and_dummy_goal',
    lines: [
      'S......G',
      '........',
      '..CD.D..'
    ],
    expectedResult: 'HasFailPath',
    expectedDummy: true,
    expectedCrows: 0
  }
];