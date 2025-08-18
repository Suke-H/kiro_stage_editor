import { describe, it, expect } from 'vitest'
import { exploreSolutions } from '@/logic/solution-explorer'
import { decodeStageFromUrl } from '../../utils/url'

export const flagTests = () => {
describe('Flag版ソルバー', () => {
    it('基本的なFlagパズルを解く', () => {
      // URL: http://localhost:5173/stage?cells=h4w4gcwwewwwgwswwewww&panels=h2w2gbbwb_h1w1gf&mode=play
      const stageData = 'cells=h4w4gcwwewwwgwswwewww&panels=h2w2gbbwb_h1w1gf'
      const { cells, panels } = decodeStageFromUrl(stageData)
      
      const solutions = exploreSolutions({
        initialGrid: cells,
        panels,
        allowSkip: true,
        findAll: true
      })
      
      console.log(`Flag解の数: ${solutions.length}`)
      solutions.forEach((solution, i) => {
        console.log(`解${i}:`)
        solution.phases.forEach((phase, phaseIndex) => {
          console.log(`  フェーズ${phaseIndex}:`)
          phase.forEach(placement => {
            console.log(`    {panel-id}: ${placement.panel.id}, highlight: {x: ${placement.highlight.x}, y: ${placement.highlight.y}}, pos: {x: ${placement.point.x}, y: ${placement.point.y}}`)
          })
        })
        console.log(`  phaseHistory長: ${solution.phaseHistory.length}`)
      })
      
      expect(solutions.length).toBeGreaterThan(0)
      
      // Flagパズルの特徴：フェーズ履歴は増えない（旗地点は記録されない）
      solutions.forEach(solution => {
        expect(solution.phases).toBeDefined()
        expect(Array.isArray(solution.phases)).toBe(true)
        // Flagの場合、phaseHistoryは初期グリッドのみ
        expect(solution.phaseHistory.length).toBe(1)
      })
    })

    it('複数Flag地点があるパズルを解く', () => {
      // 複数Flagを含むテストケース（必要に応じて追加）
      // 現在は1つのテストケースのみ
    })

    it('Flag + Rest混在パズルを解く', () => {
      // Flag と Rest が混在するケースのテスト（今後追加可能）
    })
})
}