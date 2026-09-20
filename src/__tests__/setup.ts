import { appendFileSync } from 'node:fs'
import { afterEach, beforeEach, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

const testExecutionLog = 'test-execution.log'

const writeTestLog = (event: 'START' | 'END', testName: string) => {
  const timestamp = new Date().toISOString()
  appendFileSync(testExecutionLog, `${timestamp} [${event}] ${testName}\n`, 'utf8')
}

beforeEach(({ task }) => {
  writeTestLog('START', task.name)
})

afterEach(({ task }) => {
  writeTestLog('END', task.name)
})
