export type GridCellKey =
  | "Flip"
  | "Empty"
  | "Normal"
  | "Start"
  | "Goal"
  | "DummyGoal"
  | "Crow"
  | "Wolf"
  | "Warp"
  | "ArrowUpDown"
  | "ArrowRightLeft"
  | "Rest"
  | "FootUp"
  | "FootRight"
  | "FootDown"
  | "FootLeft"
  | "Flag"

export type GridCell = {
  type: GridCellKey;
  side: "neutral" | "front" | "back";
};

export type Grid = GridCell[][];


