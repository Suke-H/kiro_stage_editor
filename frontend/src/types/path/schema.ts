export enum Result {
  NoStart = "NoStart",
  NoGoal = "NoGoal",
  NoPath = "NoPath",
  HasClearPath = "HasClearPath",
  HasFailPath = "HasFailPath",
}

export const resultMessages: Record<Result, string> = {
  [Result.NoStart]: "スタート地点がありません",
  [Result.NoGoal]: "ゴール地点がありません",
  [Result.NoPath]: "経路がありませんでした",
  [Result.HasClearPath]: "ゴールできました！🎉",
  [Result.HasFailPath]: "間違った道でした...😢",
};

export type Vector = {
  x: number;
  y: number;
};

export type Path = Vector[];

export interface PathResult{
  result: Result;
  path: Path;
}
