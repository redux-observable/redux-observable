import { ajax } from 'rxjs/ajax'
import { TestScheduler } from 'rxjs/testing'
import { receiveUserRepos, requestReposByUser } from '../actions'
import fetchReposByUserEpic from './fetchReposByUser'

jest.mock('rxjs/ajax')

const user = 'tanem'
const repos = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]

test('fetching user repos', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('-a', {
      a: requestReposByUser('tanem')
    })

    ajax.getJSON.mockImplementation(() =>
      cold('--a', {
        a: repos
      })
    )

    const output$ = fetchReposByUserEpic(action$)

    expectObservable(output$).toBe('---a', {
      a: receiveUserRepos(user, repos)
    })
  })
})
