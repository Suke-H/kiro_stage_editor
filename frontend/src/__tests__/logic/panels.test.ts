import { describe, it, expect } from 'vitest'
import { placePanels } from '@/logic/panels'
import { Panel } from '@/types/panel'
import { PanelPlacement } from '@/types/panel-placement'
import { gridFrom } from './test-utils'

describe('パネル配置ロジック', () => {
  const blackPanel: Panel = {
    id: 'test-panel',
    cells: [
      ['Black', 'White'],
      ['White', 'Black']
    ]
  }
  
  const simpleBlackPanel: Panel = {
    id: 'simple-panel', 
    cells: [['Black']]
  }

  describe('配置可能性判定', () => {
    it('Normal(front)セルに配置可能', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [resultGrid, success] = placePanels(grid, [placement])
      expect(success).toBe(true)
      expect(resultGrid[1][1].side).toBe('back') // front → back に反転
    })
    
    it('Normal(back)セルには配置不可', () => {
      const grid = gridFrom([
        'S...',
        '.x..',  // x = Normal(back)
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [, success] = placePanels(grid, [placement])
      expect(success).toBe(false)
    })
    
    it('Empty(#)セルには配置不可', () => {
      const grid = gridFrom([
        'S...',
        '.#..',  // # = Empty
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [, success] = placePanels(grid, [placement])
      expect(success).toBe(false)
    })
    
    it('盤外にはみ出る配置は不可', () => {
      const grid = gridFrom([
        'S..',
        '...',
        '..G'
      ])
      
      const placement: PanelPlacement = {
        panel: blackPanel, // 2x2パネル
        highlight: { x: 0, y: 0 },
        point: { x: 2, y: 2 } // 右下角、はみ出る
      }
      
      const [, success] = placePanels(grid, [placement])
      expect(success).toBe(false)
    })
  })
  
  describe('side状態の反転', () => {
    it('front → back への反転', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [resultGrid, success] = placePanels(grid, [placement])
      expect(success).toBe(true)
      expect(resultGrid[1][1].side).toBe('back')
    })
    
    it('back → front への反転', () => {
      const grid = gridFrom([
        'S...',
        '....',  // Normal(front)で開始
        '...G'
      ])
      
      // 手動でback状態に変更（テスト用）
      grid[1][1] = { type: 'Normal', side: 'back' }
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      // この場合は配置不可のはず（Normal(back)には配置できない）
      const [, success] = placePanels(grid, [placement])
      expect(success).toBe(false)
    })
    
    it('neutralは変更されない', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      // Start地点に配置（neutralなので変更されない）
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 0, y: 0 }
      }
      
      const [, success] = placePanels(grid, [placement])
      expect(success).toBe(false) // Start(neutral)には配置不可
    })
  })
  
  describe('複数パネル配置', () => {
    it('複数パネルの同時配置', () => {
      const grid = gridFrom([
        'S....',
        '.....',
        '.....',
        '....G'
      ])
      
      const placements: PanelPlacement[] = [
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 1, y: 1 }
        },
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 3, y: 2 }
        }
      ]
      
      const [resultGrid, success] = placePanels(grid, placements)
      expect(success).toBe(true)
      expect(resultGrid[1][1].side).toBe('back')
      expect(resultGrid[2][3].side).toBe('back')
    })
    
    it('一つでも配置不可なら全て失敗', () => {
      const grid = gridFrom([
        'S...',
        '....',
        '..G.'
      ])
      
      const placements: PanelPlacement[] = [
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 1, y: 1 } // 配置可能
        },
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 0, y: 0 } // Start地点、配置不可
        }
      ]
      
      const [, success] = placePanels(grid, placements)
      expect(success).toBe(false)
    })
  })
  
  describe('mutateオプション', () => {
    it('mutate=falseでは元のグリッドは変更されない', () => {
      const originalGrid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [resultGrid, success] = placePanels(originalGrid, [placement], false)
      expect(success).toBe(true)
      expect(resultGrid[1][1].side).toBe('back')
      expect(originalGrid[1][1].side).toBe('front') // 元は変更されない
    })
    
    it('mutate=trueでは元のグリッドが変更される', () => {
      const originalGrid = gridFrom([
        'S...',
        '....',
        '...G'
      ])
      
      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 }
      }
      
      const [resultGrid, success] = placePanels(originalGrid, [placement], true)
      expect(success).toBe(true)
      expect(resultGrid[1][1].side).toBe('back')
      expect(originalGrid[1][1].side).toBe('back') // 元も変更される
      expect(resultGrid).toBe(originalGrid) // 同じオブジェクト
    })
  })
})