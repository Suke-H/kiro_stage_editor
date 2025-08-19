import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const dummyGoalTests = () => {
  describe('DummyGoalギミック', () => {
    it('DummyGoalパズル1を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5geeweeewwwewwwwwwwdwwswwbg&panels=h1w2gbb_h2w1gbb_h2w1gbb&mode=play
      const stageData = 'cells=h5w5geeweeewwwewwwwwwwdwwswwbg&panels=h1w2gbb_h2w1gbb_h2w1gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('DummyGoalパズル2を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5ggwwwwwbbbwdbcbcwbbbwswwww&panels=h3w3gwwbwbwbww_h3w3gbwwwbwwwb_h3w3gwwbwbwbww&mode=play
      const stageData = 'cells=h5w5ggwwwwwbbbwdbcbcwbbbwswwww&panels=h3w3gwwbwbwbww_h3w3gbwwwbwwwb_h3w3gwwbwbwbww'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })
  })
}