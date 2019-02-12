import { push } from 'react-router-redux'
import { TestScheduler } from 'rxjs/testing'
import { accessDenied, CHECKED_ADMIN_ACCESS } from '../actions'
import adminAccessEpic from './adminAccess'

describe('adminAccess epic', () => {
  describe('when admin access is checked', () => {
    it('creates actions to deny access and redirect back home', () => {
      const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })

      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: { type: CHECKED_ADMIN_ACCESS }
        })
        const state$ = null
        const output$ = adminAccessEpic(action$, state$)

        expectObservable(output$).toBe('- 2000ms a 1999ms b -', {
          a: accessDenied(),
          b: push('/')
        })
      })
    })
  })
})
