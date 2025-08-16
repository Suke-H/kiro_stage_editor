import { GridCellKey } from "./schema";

export type CellSideInfo = {
  code: string;
  picture: string;
};

export type CellDefinition = {
  label: string;
  color: string;
  neutral?: CellSideInfo;
  front?: CellSideInfo;
  back?: CellSideInfo;
};

export const GRID_CELL_TYPES: Record<GridCellKey, CellDefinition> = {
  Flip: { label: "反転", color: "bg-black" },
  Empty: {
    label: "空",
    color: "bg-white",
    neutral: { code: "e", picture: "empty.png" },
  },
  Normal: {
    label: "通常床",
    color: "bg-[#DAE0EA]",
    front: { code: "w", picture: "white.png" },
    back: { code: "b", picture: "black.png" },
  },
  Start: {
    label: "スタート",
    color: "bg-green-500",
    neutral: { code: "s", picture: "start.png" },
  },
  Goal: {
    label: "ゴール",
    color: "bg-blue-500",
    neutral: { code: "g", picture: "goal.png" },
  },
  DummyGoal: {
    label: "ダミーゴール",
    color: "bg-red-500",
    neutral: { code: "d", picture: "dummy-goal.png" },
  },
  Crow: {
    label: "カラス",
    color: "bg-black",
    front: { code: "c", picture: "crow.png" },
    back: { code: "C", picture: "black.png" },
  },
  Wolf: {
    label: "オオカミ",
    color: "bg-gray-500",
    neutral: { code: "o", picture: "wolf.png" },
  },
  Trauma: {
    label: "トラウマ",
    color: "bg-purple-500",
    front: { code: "t", picture: "warp-white.png" },
    back: { code: "T", picture: "warp-black.png" },
  },
  Rest: {
    label: "休憩",
    color: "bg-yellow-500",
    neutral: { code: "r", picture: "rest.png" },
  },
    FootUp: {
    label: "足あと↑",
    color: "bg-gray-200",
    neutral: { code: "fu", picture: "foot_up.png" },
  },
  FootRight: {
    label: "足あと→",
    color: "bg-gray-200",
    neutral: { code: "fr", picture: "foot_right.png" },
  },
  FootDown: {
    label: "足あと↓",
    color: "bg-gray-200",
    neutral: { code: "fd", picture: "foot_down.png" },
  },
  FootLeft: {
    label: "足あと←",
    color: "bg-gray-200",
    neutral: { code: "fl", picture: "foot_left.png" },
  },
  Flag: {
    label: "フラグ",
    color: "bg-gray-200",
    neutral: { code: "f", picture: "flag.png" },
  },
} as const;
