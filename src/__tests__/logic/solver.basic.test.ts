import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const basicTests = () => {
  describe('基本機能', () => {
    it('基本的なパズル1を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h1w7gswbbbbg&panels=h1w4gbbbb&mode=play
      const stageData = 'cells=h1w7gswbbbbg&panels=h1w4gbbbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })
    
    it('基本的なパズル2を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5geeegeebbbwebbbwsbbbwewwwe&panels=h2w2gwbbw_h1w3gbwb&mode=play
      const stageData = 'cells=h5w5geeegeebbbwebbbwsbbbwewwwe&panels=h2w2gwbbw_h1w3gbwb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
    })
  })
}