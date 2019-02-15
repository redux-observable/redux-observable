import { ajax } from 'rxjs/ajax'
import { TestScheduler } from 'rxjs/testing'
import { receiveUserRepos, requestReposByUser } from '../actions'
import fetchReposByUserEpic from './fetchReposByUser'

jest.mock('rxjs/ajax')

describe('fetchReposByUser epic', () => {
  describe('when user repos are requested', () => {
    it('creates an action to receive user repos', () => {
      const user = 'tanem'
      const repos = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]

      const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })

      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action$ = hot('-a', {
          a: requestReposByUser('tanem')
        })
        const state$ = null
        ajax.getJSON.mockImplementation(() =>
          cold('--a', {
            a: repos
          })
        )

        const output$ = fetchReposByUserEpic(action$, state$)

        expectObservable(output$).toBe('---a', {
          a: receiveUserRepos(user, repos)
        })
      })
    })
  })
})
