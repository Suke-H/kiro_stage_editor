import { describe, it, expect } from 'vitest'
import {
  inBounds,
  isPassable,
  findSingle,
  findAll,
  deepCopyGrid,
  flipSide,
  getNeighbors,
  pointEquals,
  pointInArray,
  Point
} from '@/logic/utils'
import { GridCell } from '@/types/grid'
import { gridFrom } from './test-utils'

describe('ユーティリティ関数', () => {
  describe('inBounds', () => {
    const grid = gridFrom([
      'S...',
      '....',
      '...G'
    ])
    
    it('範囲内の座標でtrue', () => {
      expect(inBounds({ x: 0, y: 0 }, grid)).toBe(true)
      expect(inBounds({ x: 3, y: 2 }, grid)).toBe(true)
      expect(inBounds({ x: 1, y: 1 }, grid)).toBe(true)
    })
    
    it('範囲外の座標でfalse', () => {
      expect(inBounds({ x: -1, y: 0 }, grid)).toBe(false)
      expect(inBounds({ x: 4, y: 0 }, grid)).toBe(false)
      expect(inBounds({ x: 0, y: -1 }, grid)).toBe(false)
      expect(inBounds({ x: 0, y: 3 }, grid)).toBe(false)
    })
  })
  
  describe('isPassable', () => {
    it('Normal(front)は通行可能', () => {
      const cell: GridCell = { type: 'Normal', side: 'front' }
      expect(isPassable(cell)).toBe(true)
    })
    
    it('Normal(back)は通行不可', () => {
      const cell: GridCell = { type: 'Normal', side: 'back' }
      expect(isPassable(cell)).toBe(false)
    })
    
    it('Emptyは通行不可', () => {
      const cell: GridCell = { type: 'Empty', side: 'neutral' }
      expect(isPassable(cell)).toBe(false)
    })
    
    it('Start/Goal/Crowなどは通行可能', () => {
      const startCell: GridCell = { type: 'Start', side: 'neutral' }
      const goalCell: GridCell = { type: 'Goal', side: 'neutral' }
      const crowCell: GridCell = { type: 'Crow', side: 'neutral' }
      
      expect(isPassable(startCell)).toBe(true)
      expect(isPassable(goalCell)).toBe(true)
      expect(isPassable(crowCell)).toBe(true)
    })
  })
  
  describe('findSingle', () => {
    const grid = gridFrom([
      'S..G',
      '....',
      'C..D'
    ])
    
    it('存在するセルの座標を返す', () => {
      expect(findSingle(grid, 'Start')).toEqual({ x: 0, y: 0 })
      expect(findSingle(grid, 'Goal')).toEqual({ x: 3, y: 0 })
      expect(findSingle(grid, 'Crow')).toEqual({ x: 0, y: 2 })
      expect(findSingle(grid, 'DummyGoal')).toEqual({ x: 3, y: 2 })
    })
    
    it('存在しないセルにはnullを返す', () => {
      expect(findSingle(grid, 'Rest')).toBeNull()
      expect(findSingle(grid, 'Wolf')).toBeNull()
    })
  })
  
  describe('findAll', () => {
    const grid = gridFrom([
      'C.CG',
      '....',
      'C..C'
    ])
    
    it('全ての該当セル座標を返す', () => {
      const crowPositions = findAll(grid, 'Crow')
      expect(crowPositions).toHaveLength(4)
      expect(crowPositions).toContainEqual({ x: 0, y: 0 })
      expect(crowPositions).toContainEqual({ x: 2, y: 0 })
      expect(crowPositions).toContainEqual({ x: 0, y: 2 })
      expect(crowPositions).toContainEqual({ x: 3, y: 2 })
    })
    
    it('存在しないセルには空配列を返す', () => {
      const restPositions = findAll(grid, 'Rest')
      expect(restPositions).toEqual([])
    })
  })
  
  describe('deepCopyGrid', () => {
    it('グリッドの深いコピーを作成', () => {
      const original = gridFrom([
        'S..',
        '...',
        '..G'
      ])
      
      const copy = deepCopyGrid(original)
      
      // 異なるオブジェクトであることを確認
      expect(copy).not.toBe(original)
      expect(copy[0]).not.toBe(original[0])
      expect(copy[0][0]).not.toBe(original[0][0])
      
      // 内容は同じであることを確認
      expect(copy).toEqual(original)
      
      // 一方を変更してもう一方に影響しないことを確認
      copy[1][1].side = 'back'
      expect(original[1][1].side).toBe('front')
    })
  })
  
  describe('flipSide', () => {
    it('front → back', () => {
      expect(flipSide('front')).toBe('back')
    })
    
    it('back → front', () => {
      expect(flipSide('back')).toBe('front')
    })
    
    it('neutralはfrontになる', () => {
      expect(flipSide('neutral')).toBe('front')
    })
  })
  
  describe('getNeighbors', () => {
    it('隣接する4方向の座標を返す', () => {
      const point: Point = { x: 2, y: 2 }
      const neighbors = getNeighbors(point)
      
      expect(neighbors).toHaveLength(4)
      expect(neighbors).toContainEqual({ x: 2, y: 1 }) // up
      expect(neighbors).toContainEqual({ x: 2, y: 3 }) // down
      expect(neighbors).toContainEqual({ x: 1, y: 2 }) // left
      expect(neighbors).toContainEqual({ x: 3, y: 2 }) // right
    })
  })
  
  describe('pointEquals', () => {
    it('同じ座標でtrue', () => {
      const point1: Point = { x: 1, y: 2 }
      const point2: Point = { x: 1, y: 2 }
      expect(pointEquals(point1, point2)).toBe(true)
    })
    
    it('異なる座標でfalse', () => {
      const point1: Point = { x: 1, y: 2 }
      const point2: Point = { x: 2, y: 1 }
      expect(pointEquals(point1, point2)).toBe(false)
    })
  })
  
  describe('pointInArray', () => {
    const points: Point[] = [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 0, y: 0 }
    ]
    
    it('配列に含まれる座標でtrue', () => {
      expect(pointInArray({ x: 1, y: 1 }, points)).toBe(true)
      expect(pointInArray({ x: 2, y: 3 }, points)).toBe(true)
      expect(pointInArray({ x: 0, y: 0 }, points)).toBe(true)
    })
    
    it('配列に含まれない座標でfalse', () => {
      expect(pointInArray({ x: 1, y: 2 }, points)).toBe(false)
      expect(pointInArray({ x: 3, y: 3 }, points)).toBe(false)
    })
  })
})