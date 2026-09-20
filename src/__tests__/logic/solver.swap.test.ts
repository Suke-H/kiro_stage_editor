import { describe, expect, it } from 'vitest';
import { solveAllWithRest } from '@/logic/solver';
import { decodeStageFromUrl } from '../../utils/url';

const usesPanelType = (
  solution: ReturnType<typeof solveAllWithRest>[number],
  panelType: 'Swap' | 'Flag',
): boolean =>
  solution.phases.some((phase) =>
    phase.some((placement) => placement.panel.type === panelType),
  );

export const swapTests = () => {
  describe('入れ替えパネル対応ソルバー', () => {
    it('入れ替えパネルを使って解ける', () => {
      // URL: http://localhost:5173/stage?cells=h4w4gwcwwwwswwwwcgwww&panels=h2w2gwbbw_h2w1gbb_s-h1w1gs&mode=play
      const stageData =
        'cells=h4w4gwcwwwwswwwwcgwww&panels=h2w2gwbbw_h2w1gbb_s-h1w1gs';
      const { cells, panels } = decodeStageFromUrl(stageData);

      const solutions = solveAllWithRest(cells, panels);

      expect(solutions.some((solution) => usesPanelType(solution, 'Swap'))).toBe(true);
    });

    it('入れ替えパネルと旗パネルを使って解ける', () => {
      // URL: http://localhost:5173/stage?cells=h5w4geeeewwsewwwccwwgeeee&panels=f-h1w1gf_s-h1w1gs&mode=play
      const stageData =
        'cells=h5w4geeeewwsewwwccwwgeeee&panels=f-h1w1gf_s-h1w1gs';
      const { cells, panels } = decodeStageFromUrl(stageData);

      const solutions = solveAllWithRest(cells, panels);
      const solutionUsingSwapAndFlag = solutions.some(
        (solution) =>
          usesPanelType(solution, 'Swap') && usesPanelType(solution, 'Flag'),
      );

      expect(solutionUsingSwapAndFlag).toBe(true);
    });
  });
};
