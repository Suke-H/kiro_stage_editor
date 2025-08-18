import { describe, it, expect } from 'vitest'
import { solveAll } from '@/logic/solver'
import { Panel } from '@/types/panel'
import { gridFrom } from './test-utils'

export const crowTests = () => {
describe('Crowギミック', () => {
  const singleBlackPanel: Panel = {
    id: 'single-black',
    cells: [['Black']]
  }
  
  describe('Crow収集パズル', () => {
    it('カラス収集が必要なパズル', () => {
      const grid = gridFrom([
        '..G',
        '.C.',
        'S..'
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels, true)
      
      // カラスを通る解のみが有効
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('2つのパネルでCrowへの路を作る', () => {
      const grid = gridFrom([
        'S.x.C.x.G',
        '.xxxxxxx.',
        '.........'
      ])
      
      const panel1: Panel = { id: 'p1', cells: [['Black']] }
      const panel2: Panel = { id: 'p2', cells: [['Black']] }
      const panels = [panel1, panel2]
      const solutions = solveAll(grid, panels)
      
      expect(solutions.length).toBeGreaterThan(0)
      expect(solutions[0]).toHaveLength(2)
    })

    it('迂回路を作ってCrowを収集', () => {
      const grid = gridFrom([
        '.C.',
        'xxx',
        'SxG'
      ])
      
      // 1x1パネルを2つ
      const panel1: Panel = {
        id: 'panel1',
        cells: [['Black']]
      }
      const panel2: Panel = {
        id: 'panel2',
        cells: [['Black']]
      }
      
      const panels = [panel1, panel2]
      const solutions = solveAll(grid, panels)
      
      expect(solutions.length).toBeGreaterThan(0)
      expect(solutions[0]).toHaveLength(2)
    })
  })
})
}