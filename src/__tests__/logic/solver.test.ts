import { describe } from 'vitest'
import { basicTests } from './solver.basic'
import { crowTests } from './solver.crow'
import { dummyGoalTests } from './solver.dummygoal'
import { restTests } from './solver.rest'
import { flagTests } from './solver.flag'
import { cutPasteTests } from './solver.cutpaste'
import { swapTests } from './solver.swap'
import { wolfTests } from './solver.wolf'

describe('パズルソルバー', () => {
  basicTests()
  crowTests()
  dummyGoalTests()
  restTests()
  flagTests()
  cutPasteTests()
  swapTests()
  wolfTests()
})
