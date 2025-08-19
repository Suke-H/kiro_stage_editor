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
        findAll: true
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