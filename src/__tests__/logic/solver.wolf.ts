import { describe, expect, it } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const wolfTests = () => {
  describe('Wolfギミック', () => {
    it('オオカミを閉じ込める', () => {
      // URL: http://localhost:5173/stage?cells=h4w5gswwwowwwwweeewweeewg&panels=h1w2gbb_h2w1gbb&mode=play
      const stageData =
        'cells=h4w5gswwwowwwwweeewweeewg&panels=h1w2gbb_h2w1gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)

      const solutions = solveAllWithRest(cells, panels)

      expect(solutions.length).toBeGreaterThan(0)
    })

    it('オオカミをダミーゴールへ誘導する', () => {
      // URL: http://localhost:5173/stage?cells=h4w5gwwwwwswowgwwwwweewdw&panels=h2w1gbb_h1w1gb&mode=play
      const stageData =
        'cells=h4w5gwwwwwswowgwwwwweewdw&panels=h2w1gbb_h1w1gb'
      const { cells, panels } = decodeStageFromUrl(stageData)

      const solutions = solveAllWithRest(cells, panels)

      expect(solutions.length).toBeGreaterThan(0)
    })

    it('2匹のオオカミがいるステージを解く', () => {
      // URL: http://localhost:5173/stage?cells=h5w5gewwwewbwwwobswdwbwwgeowwe&panels=h2w2gbwwb_h2w2gbwwb_h3w1gbwb&mode=play
      const stageData =
        'cells=h5w5gewwwewbwwwobswdwbwwgeowwe&panels=h2w2gbwwb_h2w2gbwwb_h3w1gbwb'
      const { cells, panels } = decodeStageFromUrl(stageData)

      const solutions = solveAllWithRest(cells, panels)

      expect(solutions.length).toBeGreaterThan(0)
    })

    it('休憩とオオカミがあるステージを解く', () => {
      // URL: http://localhost:5173/stage?cells=h4w4gwrbewobgbbbeswwd&panels=h2w2gbwwb_h1w2gbb&mode=play
      const stageData =
        'cells=h4w4gwrbewobgbbbeswwd&panels=h2w2gbwwb_h1w2gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)

      const solutions = solveAllWithRest(cells, panels)

      expect(solutions.length).toBeGreaterThan(0)
      expect(
        solutions.some((solution) => solution.phases.length > 1),
      ).toBe(true)
    })
  })
}
