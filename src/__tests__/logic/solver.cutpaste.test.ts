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
      
      console.log(`Cut/Pasteステージ解の数: ${solutions.length}`)
      solutions.forEach((solution, i) => {
        console.log(`解${i}:`)
        solution.phases.forEach((phase, phaseIndex) => {
          console.log(`  フェーズ${phaseIndex}:`)
          phase.forEach(placement => {
            console.log(`    {panel-id}: ${placement.panel.id}, type: ${placement.panel.type || 'Normal'}, highlight: {x: ${placement.highlight.x}, y: ${placement.highlight.y}}, pos: {x: ${placement.point.x}, y: ${placement.point.y}}`)
          })
        })
      })
      
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