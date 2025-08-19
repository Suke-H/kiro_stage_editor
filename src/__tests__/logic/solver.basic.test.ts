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
      
      console.log(`基本パズル1解の数: ${solutions.length}`)
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
    })
    
    it('基本的なパズル2を解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h5w5geeegeebbbwebbbwsbbbwewwwe&panels=h2w2gwbbw_h1w3gbwb&mode=play
      const stageData = 'cells=h5w5geeegeebbbwebbbwsbbbwewwwe&panels=h2w2gwbbw_h1w3gbwb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      console.log(`基本パズル2解の数: ${solutions.length}`)
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
    })
  })
}