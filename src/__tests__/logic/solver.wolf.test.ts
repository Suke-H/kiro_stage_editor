import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const wolfTests = () => {
  describe('Wolfギミック', () => {
    it('Wolfパズル1を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h4w5gswwwowwwwweeewweeewg&panels=h1w2gbb_h2w1gbb&mode=play
      const stageData = 'cells=h4w5gswwwowwwwweeewweeewg&panels=h1w2gbb_h2w1gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('Wolfパズル2を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5gewwwewbwwwobswdwbwwgeowwe&panels=h2w2gbwwb_h2w2gbwwb_h3w1gbwb&mode=play
      const stageData = 'cells=h5w5gewwwewbwwwobswdwbwwgeowwe&panels=h2w2gbwwb_h2w2gbwwb_h3w1gbwb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })
  })
}