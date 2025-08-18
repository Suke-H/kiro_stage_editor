import { describe, it, expect } from 'vitest'
import { solveAll } from '@/logic/solver'
import { Panel } from '@/types/panel'
import { gridFrom } from './test-utils'

export const basicTests = () => {
describe('基本機能', () => {
  const singleBlackPanel: Panel = {
    id: 'single-black',
    cells: [['Black']]
  }
  
  describe('solveAll', () => {
    it('解が存在する簡単なパズルを解く', () => {
      const grid = gridFrom([
        'SxG'
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels)
      
      expect(solutions.length).toBeGreaterThan(0)
      expect(solutions[0]).toHaveLength(1)
      expect(solutions[0][0].panel).toBe(singleBlackPanel)
    })
    
    it('解が存在しないパズルでは空配列を返す', () => {
      const grid = gridFrom([
        'S#G'  // 壁があって到達不可
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels)
      
      expect(solutions).toEqual([])
    })
  })
})
}