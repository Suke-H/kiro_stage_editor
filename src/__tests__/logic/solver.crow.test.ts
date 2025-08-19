import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const crowTests = () => {
  describe('Crowギミック', () => {
    it('Crowパズル1を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h4w5gcwwwwwwwwgwwewwewswe&panels=h1w2gbb_h2w1gbb&mode=play
      const stageData = 'cells=h4w5gcwwwwwwwwgwwewwewswe&panels=h1w2gbb_h2w1gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('Crowパズル2を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5gwwwwgcbwwwwwbwcwwwbwswwcw&panels=h1w2gbb_h1w2gbb_h3w1gbbb&mode=play
      const stageData = 'cells=h5w5gwwwwgcbwwwwwbwcwwwbwswwcw&panels=h1w2gbb_h1w2gbb_h3w1gbbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })
  })
}