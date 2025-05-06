export enum Result{
  NoPath = "NoPath",
  HasClearPath = "HasClearPath",
  HasFailPath = "HasFailPath",
}

export type Vector = {
  x: number;
  y: number;
};

export type Path = Vector[];

export interface PathResult{
  result: Result;
  path: Path;
}
