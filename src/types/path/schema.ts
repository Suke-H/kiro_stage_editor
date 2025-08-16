import { Grid } from "../grid/schema";

export enum Result {
  NoStart = "NoStart",
  NoGoal = "NoGoal",
  NoPath = "NoPath",
  HasClearPath = "HasClearPath",
  HasFailPath = "HasFailPath",
  HasRestPath = "HasRestPath",
  HasFlagPath = "HasFlagPath",
  WolfReachedGoal = "WolfReachedGoal",
}

export const resultMessages: Record<Result, string> = {
  [Result.NoStart]: "スタート地点がありません",
  [Result.NoGoal]: "ゴール地点がありません",
  [Result.NoPath]: "経路がありませんでした",
  [Result.HasClearPath]: "ゴールできました！🎉",
  [Result.HasFailPath]: "間違った道でした...😢",
  [Result.HasRestPath]: "休憩地点に着きました！",
  [Result.HasFlagPath]: "旗に到達しました！（続けて再生をおしてね！）",
  [Result.WolfReachedGoal]: "オオカミがゴールに到達しました...",
};

export type Vector = {
  x: number;
  y: number;
};

export type Path = Vector[];

export interface PathResult{
  result: Result;
  path: Path;
  nextGrid: Grid | null;
}
