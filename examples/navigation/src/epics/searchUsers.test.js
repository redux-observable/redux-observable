import { replace } from 'connected-react-router'
import { ajax } from 'rxjs/ajax'
import { TestScheduler } from 'rxjs/testing'
import { clearSearchResults, receiveUsers, searchUsers } from '../actions'
import searchUsersEpic from './searchUsers'

jest.mock('rxjs/ajax')

const user = 'tanem'
const users = {
  total_count: 2,
  incomplete_results: false,
  items: [
    {
      login: 'tanem',
      id: 464864
    },
    {
      login: 'tanema',
      id: 463193
    }
  ]
}

afterEach(() => {
  ajax.getJSON.mockReset()
})

test('empty search query', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(ajax.getJSON).not.toHaveBeenCalled()
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot('-a', {
      a: searchUsers()
    })

    const output$ = searchUsersEpic(action$)

    expectObservable(output$).toBe('-')
  })
})

test('non-empty search query', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(ajax.getJSON).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('-a', {
      a: searchUsers(user)
    })

    ajax.getJSON.mockImplementation(() =>
      cold('-u', {
        u: users
      })
    )

    const output$ = searchUsersEpic(action$)

    expectObservable(output$).toBe('- 800ms a b', {
      a: replace(`?q=${user}`),
      b: receiveUsers(users.items)
    })
  })
})

test('frequent non-empty search queries', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(ajax.getJSON).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('-a-b-c-d-e', {
      a: searchUsers('t'),
      b: searchUsers('ta'),
      c: searchUsers('tan'),
      d: searchUsers('tane'),
      e: searchUsers('tanem')
    })

    ajax.getJSON.mockImplementation(() =>
      cold('-u', {
        u: users
      })
    )

    const output$ = searchUsersEpic(action$)

    expectObservable(output$).toBe('- 808ms a b', {
      a: replace(`?q=${user}`),
      b: receiveUsers(users.items)
    })
  })
})

test('clearing search results', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(ajax.getJSON).not.toHaveBeenCalled()
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot('-a 799ms b', {
      a: searchUsers(user),
      b: clearSearchResults()
    })

    const output$ = searchUsersEpic(action$)

    expectObservable(output$).toBe('-')
  })
})
