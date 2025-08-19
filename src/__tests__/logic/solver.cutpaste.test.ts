import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver'
import { decodeStageFromUrl } from '../../utils/url'

export const cutPasteTests = () => {
  describe('Cut/Paste版ソルバー', () => {
    it('Cut/Pasteパネルを解く', () => {
      // URL: http://localhost:5173/stage?cells=h4w4gsewwweeeeeewwweg&panels=c-h1w2gbb_c-h2w2gbbbw&mode=play
      const stageData = 'cells=h4w4gsewwweeeeeewwweg&panels=c-h1w2gbb_c-h2w2gbbbw'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      
      expect(solutions.length).toBeGreaterThan(0)
      // Cut/Pasteパネルのテスト
      solutions.forEach(solution => {
        expect(solution.phases).toBeDefined()
        expect(Array.isArray(solution.phases)).toBe(true)
        solution.phases.forEach(phase => {
          phase.forEach(placement => {
            expect(['Normal', 'Cut', 'Paste']).toContain(placement.panel.type || 'Normal')
          })
        })
      })
    })
  })
}