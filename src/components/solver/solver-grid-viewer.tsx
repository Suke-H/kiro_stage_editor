import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { Grid, GridCell } from "@/types/grid";
import { NumberGrid } from "@/types/solution";
import { GRID_CELL_TYPES, CellSideInfo } from "@/types/grid";

type Props = {
  baseGrid: Grid; // このpropsは使用しない（phaseHistory優先）
  index: number;  // 何番目の解か
};

export const SolverGridViewer: React.FC<Props> = ({ baseGrid, index }) => {
  const solutions = useSelector((s: RootState) => s.solution.solutions);
  const numberGrid: NumberGrid =
    useSelector((s: RootState) => s.solution.numberGrids[index]) || [];

  // phaseHistoryからフェーズの初期gridを取得
  let phaseGrid = baseGrid; // フォールバック
  let currentIndex = 0;

  outer: for (const solution of solutions) {
    for (let phaseIndex = 0; phaseIndex < solution.phases.length; phaseIndex++) {
      if (currentIndex === index) {
        phaseGrid = solution.phaseHistory[phaseIndex] || baseGrid;
        break outer;
      }
      currentIndex++;
    }
  }

  const renderNumberOverlay = (row: number, col: number) => {
    const num = numberGrid[row]?.[col];
    if (num == null) return null;
    return (
      <span
        className="
          absolute inset-0 z-10 flex items-center justify-center
          font-bold drop-shadow pointer-events-none
          text-yellow-300 text-base
        "
      >
        {num}
      </span>
    );
  };

  const renderGridCell = (
    cell: GridCell,
    rowIndex: number,
    colIndex: number,
  ) => {
    const cellDef = GRID_CELL_TYPES[cell.type];
    const sideInfo: CellSideInfo | undefined = cellDef[cell.side];
    if (!sideInfo) return null;

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`relative h-10 w-10 flex items-center justify-center ${
          cell.type === "Empty" ? "" : "border"
        }`}
      >
        {cell.type !== "Empty" && (
          <img
            src={`/cells/${sideInfo.picture}`}
            alt={`${cellDef.label} (${cell.side})`}
            className="w-full h-full object-contain"
          />
        )}
        {renderNumberOverlay(rowIndex, colIndex)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="font-medium">#{index + 1}</span>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${phaseGrid[0]?.length ?? 0}, 40px)`,
          gridTemplateRows: `repeat(${phaseGrid.length}, 40px)`,
          gap: "4px",
        }}
      >
        {phaseGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => renderGridCell(cell, rIdx, cIdx)),
        )}
      </div>
    </div>
  );
};
