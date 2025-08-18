import { describe } from 'vitest'
import { basicTests } from './solver.basic.test'
import { crowTests } from './solver.crow.test'
import { dummyGoalTests } from './solver.dummygoal.test'

describe('パズルソルバー', () => {
  basicTests()
  crowTests()
  dummyGoalTests()
})