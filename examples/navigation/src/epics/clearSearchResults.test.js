import { TestScheduler } from 'rxjs/testing'
import { clearSearchResults, searchUsers } from '../actions'
import clearSearchResultsEpic from './clearSearchResults'

test('non-empty search query', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot('-a', {
      a: searchUsers('jayphelps')
    })

    const output$ = clearSearchResultsEpic(action$)

    expectObservable(output$).toBe('--')
  })
})

test('empty search query', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot('-a', {
      a: searchUsers()
    })

    const output$ = clearSearchResultsEpic(action$)

    expectObservable(output$).toBe('-a', {
      a: clearSearchResults()
    })
  })
})
