import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import { Grid } from "@/types/grid";
import { exportStageToYaml } from "@/utils/yaml";

describe("YAMLのセル面変換", () => {
  const grid: Grid = [[
    { type: "Start", side: "neutral" },
    { type: "Empty", side: "front" },
    { type: "Goal", side: "back" },
  ]];

  it("neutralをFrontとして出力する", () => {
    const yaml = parse(exportStageToYaml(grid, []));

    expect(yaml.Cells[0].map((cell: { CellSide: string }) => cell.CellSide))
      .toEqual(["Front", "Front", "Back"]);
  });
});
