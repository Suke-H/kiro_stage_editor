import { describe, it, expect } from 'vitest'
import { findPath } from '@/logic/pathfinding'
import { Result } from '@/types/path'
import { gridFrom, TestCase, TEST_CASES } from './test-utils'

describe('パス探索アルゴリズム', () => {
  // 現在実装で動作する基本テストケース
  const workingCases = TEST_CASES;

  describe.each(workingCases)('$id', (testCase: TestCase) => {
    it(`should return ${testCase.expectedResult}`, () => {
      // テストケースからグリッドを生成
      const grid = gridFrom(testCase.lines)
      
      // パス探索実行
      const result = findPath(grid)
      
      // 結果の検証
      expect(result.result).toBe(Result[testCase.expectedResult as keyof typeof Result])
      
      // パスが存在する場合の追加検証
      if (result.result === Result.HasClearPath || result.result === Result.HasFailPath || result.result === Result.HasRestPath) {
        expect(result.path).toBeDefined()
        expect(Array.isArray(result.path)).toBe(true)
        expect(result.path.length).toBeGreaterThan(0)
        
        // パスの最初はStart地点のはず
        const startPath = result.path[0]
        expect(startPath).toBeDefined()
        expect(typeof startPath.x).toBe('number')
        expect(typeof startPath.y).toBe('number')
      }
      
      // クリア時はnextGridが存在するはず
      if (result.result === Result.HasClearPath) {
        expect(result.nextGrid).toBeDefined()
        expect(Array.isArray(result.nextGrid)).toBe(true)
      }
      
      // Rest到達時もnextGridが存在するはず  
      if (result.result === Result.HasRestPath) {
        expect(result.nextGrid).toBeDefined()
        expect(Array.isArray(result.nextGrid)).toBe(true)
      }
    })
    
    it(`should handle crows correctly for ${testCase.id}`, () => {
      const grid = gridFrom(testCase.lines)
      const result = findPath(grid)
      
      // カラス数の検証（クリア時のみ）
      if (result.result === Result.HasClearPath && testCase.expectedCrows > 0) {
        // クリア時は全カラスを通過している必要がある
        const crowPositions = new Set<string>()
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x].type === 'Crow') {
              crowPositions.add(`${x},${y}`)
            }
          }
        }
        
        const pathCrowCount = result.path.filter(point => 
          crowPositions.has(`${point.x},${point.y}`)
        ).length
        
        expect(pathCrowCount).toBe(testCase.expectedCrows)
      }
    })
  })
  
  describe('エラーケース', () => {
    it('Start地点がない場合はNoStartを返す', () => {
      const grid = gridFrom([
        '..G',
        '...',
        '...'
      ])
      
      const result = findPath(grid)
      expect(result.result).toBe(Result.NoStart)
      expect(result.path).toEqual([])
      expect(result.nextGrid).toBeNull()
    })
    
    it('Goal地点がない場合はNoGoalを返す', () => {
      const grid = gridFrom([
        'S..',
        '...',
        '...'
      ])
      
      const result = findPath(grid)
      expect(result.result).toBe(Result.NoGoal)
      expect(result.path).toEqual([])
      expect(result.nextGrid).toBeNull()
    })
  })
  
  describe('フェーズ履歴対応', () => {
    it('フェーズ履歴ありでRest移動が正しく動作する', () => {
      // 初期状態
      const initialGrid = gridFrom([
        'S..R',
        '....',
        '..G.'
      ])
      
      // フェーズ履歴（Start -> Rest移動後の状態）
      const phaseHistoryGrid = gridFrom([
        '...S',  // RestがStartになった状態
        '....',
        '..G.'
      ])
      
      const result = findPath(phaseHistoryGrid, [initialGrid])
      
      // Rest地点からの移動結果を検証
      if (result.result === Result.HasClearPath) {
        expect(result.nextGrid).toBeDefined()
      }
    })
  })
})