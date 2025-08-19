import { describe } from 'vitest'
import { basicTests } from './solver.basic.test'
import { crowTests } from './solver.crow.test'
import { dummyGoalTests } from './solver.dummygoal.test'
import { restTests } from './solver.rest.test'
import { flagTests } from './solver.flag.test'
import { cutPasteTests } from './solver.cutpaste.test'

describe('パズルソルバー', () => {
  basicTests()
  crowTests()
  dummyGoalTests()
  restTests()
  flagTests()
  cutPasteTests()
})