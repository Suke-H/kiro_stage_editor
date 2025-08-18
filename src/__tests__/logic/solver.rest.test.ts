import { describe, it, expect } from 'vitest'
import { solveAllWithRest } from '@/logic/solver-rest'
import { decodeStageFromUrl } from '../../utils/url'

export const restTests = () => {
  describe('Rest版ソルバー', () => {
    it('基本的なRestパズルを解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h4w4gsbbrbeebweebgbbw&panels=h2w1gbb_h1w2gbb&mode=play
      const stageData = 'cells=h4w4gsbbrbeebweebgbbw&panels=h2w1gbb_h1w2gbby'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      console.log(`解の数: ${solutions.length}`)
      solutions.forEach((solution, i) => {
        console.log(`解${i}:`)
        solution.phases.forEach((phase, phaseIndex) => {
          console.log(`  フェーズ${phaseIndex}:`)
          phase.forEach(placement => {
            console.log(`    {panel-id}: ${placement.panel.id}, highlight: {x: ${placement.highlight.x}, y: ${placement.highlight.y}}, pos: {x: ${placement.point.x}, y: ${placement.point.y}}`)
          })
        })
      })
      
      expect(solutions.length).toBeGreaterThan(0)
      expect(solutions[0].phases.length).toBeGreaterThan(1) // 複数フェーズ
    })

    it('複数Rest地点があるパズルを解く', () => {
      // URL: https://kiro-stage-editor-708973678663.asia-northeast1.run.app/stage?cells=h4w5gewwwwwwswwwwrwwrwwdg&panels=h1w2gbb_h2w1gbb&mode=play  
      const stageData = 'cells=h4w5gewwwwwwswwwwrwwrwwdg&panels=h1w2gbb_h2w1gbb'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = solveAllWithRest(cells, panels)
      
      console.log(`解の数2: ${solutions.length}`)
      solutions.forEach((solution, i) => {
        console.log(`解${i}:`)
        solution.phases.forEach((phase, phaseIndex) => {
          console.log(`  フェーズ${phaseIndex}:`)
          phase.forEach(placement => {
            console.log(`    {panel-id}: ${placement.panel.id}, highlight: {x: ${placement.highlight.x}, y: ${placement.highlight.y}}, pos: {x: ${placement.point.x}, y: ${placement.point.y}}`)
          })
        })
      })
      
      expect(solutions.length).toBeGreaterThan(0)
      // 複数Restがある場合のテスト
      solutions.forEach(solution => {
        expect(solution.phases).toBeDefined()
        expect(Array.isArray(solution.phases)).toBe(true)
      })
    })
  })
}