import { push } from 'connected-react-router'
import { TestScheduler } from 'rxjs/testing'
import { accessDenied, CHECKED_ADMIN_ACCESS } from '../actions'
import adminAccessEpic from './adminAccess'

test('checking admin access', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot('-a', {
      a: { type: CHECKED_ADMIN_ACCESS }
    })
    const output$ = adminAccessEpic(action$)

    expectObservable(output$).toBe('- 2000ms a 1999ms b -', {
      a: accessDenied(),
      b: push('/')
    })
  })
})
