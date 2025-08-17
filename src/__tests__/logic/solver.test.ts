import { describe, it, expect } from 'vitest'
import { solveSingle, solveAll, solvePuzzle } from '@/logic/solver'
import { Panel } from '@/types/panel'
import { gridFrom } from './test-utils'

describe('パズルソルバー', () => {
  const singleBlackPanel: Panel = {
    id: 'single-black',
    cells: [['Black']]
  }
  
  const twoBlackPanel: Panel = {
    id: 'two-black',
    cells: [['Black', 'Black']]
  }
  
  describe('solveSingle', () => {
    it('解が存在する簡単なパズルを解く', () => {
      const grid = gridFrom([
        'S.',
        '.G'
      ])
      
      const panels = [singleBlackPanel]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
      expect(solution).toHaveLength(1)
      expect(solution![0].panel).toBe(singleBlackPanel)
    })
    
    it('解が存在しないパズルではnullを返す', () => {
      const grid = gridFrom([
        'S#G'  // 壁があって到達不可
      ])
      
      const panels = [singleBlackPanel]
      const solution = solveSingle(grid, panels)
      
      expect(solution).toBeNull()
    })
    
    it('パネルなしでもクリア可能な場合', () => {
      const grid = gridFrom([
        'S.G'  // そのままクリア可能
      ])
      
      const panels = [singleBlackPanel]
      const solution = solveSingle(grid, panels)
      
      // パネル配置しなくてもクリア可能だが、
      // このソルバーは全パネル必須なのでnullを返す
      expect(solution).toBeNull()
    })
  })
  
  describe('solveAll', () => {
    it('複数解が存在する場合は全て返す', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels, true)
      
      expect(solutions.length).toBeGreaterThan(0)
      
      // 各解がクリア可能か検証
      for (const solution of solutions) {
        expect(Array.isArray(solution)).toBe(true)
        expect(solution.length).toBeLessThanOrEqual(panels.length)
      }
    })
    
    it('allowSkip=falseの場合は全パネル使用解のみ', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const panels = [singleBlackPanel, singleBlackPanel]
      const solutions = solveAll(grid, panels, false)
      
      // 全解が全パネルを使用している
      for (const solution of solutions) {
        expect(solution.length).toBe(panels.length)
      }
    })
    
    it('解が存在しない場合は空配列', () => {
      const grid = gridFrom([
        'S#G'  // 到達不可
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels, true)
      
      expect(solutions).toEqual([])
    })
  })
  
  describe('solvePuzzle', () => {
    it('APIレスポンス形式で結果を返す', () => {
      const grid = gridFrom([
        'S.',
        '.G'
      ])
      
      const panels = [singleBlackPanel]
      const response = solvePuzzle(grid, panels)
      
      expect(response).toHaveProperty('solutions')
      expect(Array.isArray(response.solutions)).toBe(true)
      expect(response.solutions.length).toBeGreaterThan(0)
    })
    
    it('解が存在しない場合は空の解配列', () => {
      const grid = gridFrom([
        'S#G'
      ])
      
      const panels = [singleBlackPanel]
      const response = solvePuzzle(grid, panels)
      
      expect(response.solutions).toEqual([])
    })
  })
  
  describe('複雑なパズル', () => {
    it('カラス収集が必要なパズル', () => {
      const grid = gridFrom([
        'C.G',
        '...',
        'S..'
      ])
      
      const panels = [singleBlackPanel]
      const solutions = solveAll(grid, panels, true)
      
      // カラスを通る解のみが有効
      expect(solutions.length).toBeGreaterThan(0)
    })
    
    it('複数パネルを使用するパズル', () => {
      const grid = gridFrom([
        'S....',
        '.....',
        '.....',
        '....G'
      ])
      
      const panels = [singleBlackPanel, twoBlackPanel]
      const solutions = solveAll(grid, panels, true)
      
      expect(solutions.length).toBeGreaterThan(0)
      
      // 各解の妥当性を検証
      for (const solution of solutions) {
        expect(solution.length).toBeLessThanOrEqual(panels.length)
        
        // 各配置のpointとhighlightが正しく設定されている
        for (const placement of solution) {
          expect(placement.point).toBeDefined()
          expect(placement.highlight).toBeDefined()
          expect(placement.panel).toBeDefined()
          expect(typeof placement.point.x).toBe('number')
          expect(typeof placement.point.y).toBe('number')
        }
      }
    })
  })
  
  describe('複数セル・複数パネルを使ったパズル', () => {
    it('2x1パネルで橋を作る', () => {
      const grid = gridFrom([
        'S.xx.G'
      ])
      
      // 2セルの横長パネル
      const bridgePanel: Panel = {
        id: 'bridge',
        cells: [['Black', 'Black']]
      }
      
      const panels = [bridgePanel]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
      expect(solution).toHaveLength(1)
    })

    it('L字型パネルで複雑な経路を作る', () => {
      const grid = gridFrom([
        'S.xx.',
        '.xxx.',
        'G....'
      ])
      
      // L字型パネル
      const lShapePanel: Panel = {
        id: 'lshape',
        cells: [
          ['Black', 'Black'],
          ['Black', 'White']
        ]
      }
      
      const panels = [lShapePanel]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
    })

    it('複数の1x1パネルで道を繋ぐ', () => {
      const grid = gridFrom([
        'S.x.x.G'
      ])
      
      // 2つの1x1パネル
      const panel1: Panel = {
        id: 'panel1',
        cells: [['Black']]
      }
      const panel2: Panel = {
        id: 'panel2', 
        cells: [['Black']]
      }
      
      const panels = [panel1, panel2]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
      expect(solution).toHaveLength(2)
    })

    it('3つのパネルでCrow経由路を作る', () => {
      const grid = gridFrom([
        'S.x.C.x.G',
        '.xxxxxxx.',
        '.........'
      ])
      
      const panel1: Panel = { id: 'p1', cells: [['Black']] }
      const panel2: Panel = { id: 'p2', cells: [['Black']] }
      const panel3: Panel = { id: 'p3', cells: [['Black']] }
      
      const panels = [panel1, panel2, panel3]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
      expect(solution).toHaveLength(3)
    })

    it('T字型パネルで分岐路を作る', () => {
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
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
      expect(solution).toHaveLength(2)
    })

    it('Rest地点を経由してからGoalに向かう必要があるパズル', () => {
      const grid = gridFrom([
        'S.x.G',
        '.....',
        '.xRx.'
      ])
      
      // パネル配置でRest地点への道を作る
      const bridgePanel: Panel = {
        id: 'bridge',
        cells: [['Black']]
      }
      
      const panels = [bridgePanel]
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
    })

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
      const solution = solveSingle(grid, panels)
      
      expect(solution).not.toBeNull()
    })
  })


})