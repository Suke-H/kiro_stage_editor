export enum PathResult{
  NoPath = "NoPath",
  HasClearPath = "HasClearPath",
  HasFailPath = "HasFailPath",
}

export type Vector = {
  x: number;
  y: number;
};

export type Path = Vector[];
