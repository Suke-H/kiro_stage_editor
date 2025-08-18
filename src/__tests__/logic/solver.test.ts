import { describe } from 'vitest'
import { basicTests } from './solver.basic.test'
import { crowTests } from './solver.crow.test'
import { dummyGoalTests } from './solver.dummygoal.test'
import { restTests } from './solver.rest.test'

describe('パズルソルバー', () => {
  basicTests()
  crowTests()
  dummyGoalTests()
  restTests()
})