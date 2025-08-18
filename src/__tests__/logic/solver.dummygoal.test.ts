import { describe, it, expect } from 'vitest'
import { solveAll } from '@/logic/solver'
import { Panel } from '@/types/panel'
import { gridFrom } from './test-utils'

export const dummyGoalTests = () => {
describe('DummyGoalギミック', () => {
  describe('DummyGoal回避パズル', () => {
    it('DummyGoalを避けてGoalに向かうためのパネル配置', () => {
      const grid = gridFrom([
        'S..D',
        '....',
        '....',
        '...G'
      ])
      
      // L字型パネル
      const lShapePanel: Panel = {
        id: 'lshape',
        cells: [
          ['Black', 'White'],
          ['Black', 'Black']
        ]
      }
      
      const panels = [lShapePanel]
      const solutions = solveAll(grid, panels)
      
      expect(solutions.length).toBeGreaterThan(0)
    })
  })
})
}