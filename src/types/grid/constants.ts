import { GridCellKey } from "./schema";

export type CellSideInfo = {
  code: string;
  picture: string;
};

export type CellDefinition = {
  label: string;
  color: string;
  defaultSide: "neutral" | "front" | "back";
  neutral?: CellSideInfo;
  front?: CellSideInfo;
  back?: CellSideInfo;
};

export const GRID_CELL_TYPES: Record<GridCellKey, CellDefinition> = {
  Flip: { label: "反転", color: "bg-black", defaultSide: "neutral" },
  Empty: {
    label: "空",
    color: "bg-white",
    defaultSide: "neutral",
    neutral: { code: "e", picture: "empty.png" },
  },
  Normal: {
    label: "通常床",
    color: "bg-[#DAE0EA]",
    defaultSide: "front",
    front: { code: "w", picture: "white.png" },
    back: { code: "b", picture: "black.png" },
  },
  Start: {
    label: "スタート",
    color: "bg-green-500",
    defaultSide: "front",
    neutral: { code: "s", picture: "start.png" },
    front:   { code: "SF", picture: "start.png" },
    back:    { code: "SB", picture: "start_black.png" },
  },
  Goal: {
    label: "ゴール",
    color: "bg-blue-500",
    defaultSide: "front",
    neutral: { code: "g", picture: "goal.png" },
    front:   { code: "GF", picture: "goal.png" },
    back:    { code: "GB", picture: "goal_black.png" },
  },
  DummyGoal: {
    label: "ダミーゴール",
    color: "bg-red-500",
    defaultSide: "front",
    neutral: { code: "d", picture: "dummy-goal.png" },
    front:   { code: "DF", picture: "dummy-goal.png" },
    back:    { code: "DB", picture: "dummy-goal_black.png" },
  },
  Crow: {
    label: "カラス",
    color: "bg-black",
    defaultSide: "front",
    front: { code: "c", picture: "crow.png" },
    back: { code: "C", picture: "crow_black.png" },
  },
  Wolf: {
    label: "オオカミ",
    color: "bg-gray-500",
    defaultSide: "front",
    neutral: { code: "o", picture: "wolf.png" },
    front:   { code: "OF", picture: "wolf.png" },
    back:    { code: "OB", picture: "wolf_black.png" },
  },
  Trauma: {
    label: "トラウマ",
    color: "bg-purple-500",
    defaultSide: "front",
    front: { code: "t", picture: "warp-white.png" },
    back: { code: "T", picture: "warp-black.png" },
  },
  Rest: {
    label: "休憩",
    color: "bg-yellow-500",
    defaultSide: "front",
    neutral: { code: "r", picture: "rest.png" },
    front:   { code: "RF", picture: "rest.png" },
    back:    { code: "RB", picture: "rest_black.png" },
  },
  FootUp: {
    label: "足あと↑",
    color: "bg-gray-200",
    defaultSide: "front",
    neutral: { code: "fu", picture: "foot_up.png" },
    front:   { code: "fu", picture: "foot_up.png" },
    back:    { code: "FU", picture: "foot_up_black.png" },
  },
  FootRight: {
    label: "足あと→",
    color: "bg-gray-200",
    defaultSide: "front",
    neutral: { code: "fr", picture: "foot_right.png" },
    front:   { code: "fr", picture: "foot_right.png" },
    back:    { code: "FR", picture: "foot_right_black.png" },
  },
  FootDown: {
    label: "足あと↓",
    color: "bg-gray-200",
    defaultSide: "front",
    neutral: { code: "fd", picture: "foot_down.png" },
    front:   { code: "fd", picture: "foot_down.png" },
    back:    { code: "FD", picture: "foot_down_black.png" },
  },
  FootLeft: {
    label: "足あと←",
    color: "bg-gray-200",
    defaultSide: "front",
    neutral: { code: "fl", picture: "foot_left.png" },
    front:   { code: "fl", picture: "foot_left.png" },
    back:    { code: "FL", picture: "foot_left_black.png" },
  },
  Flag: {
    label: "フラグ",
    color: "bg-gray-200",
    defaultSide: "front",
    neutral: { code: "f", picture: "flag.png" },
    front:   { code: "FF", picture: "flag.png" },
    back:    { code: "FB", picture: "flag_black.png" },
  },
  Switch: {
    label: "スイッチ",
    color: "bg-orange-400",
    defaultSide: "back",
    front: { code: "h", picture: "switch_on.png" },
    back:  { code: "H", picture: "switch_off.png" },
  },
  Wall: {
    label: "壁",
    color: "bg-gray-800",
    defaultSide: "back",
    back:  { code: "l", picture: "wall.png" },
    front: { code: "L", picture: "wall_open.png" },
  },
  InvertCell: {
    label: "反転マス",
    color: "bg-[#B0C4DE]",
    defaultSide: "front",
    front: { code: "v", picture: "warp-white.png" },
    back:  { code: "V", picture: "warp-black.png" },
  },
  InvertSwitch: {
    label: "反転スイッチ",
    color: "bg-purple-400",
    defaultSide: "back",
    front: { code: "j", picture: "flip_switch_on.png" },
    back:  { code: "J", picture: "flip_switch_off.png" },
  },
} as const;
