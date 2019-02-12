import { TestScheduler } from 'rxjs/testing'
import { clearSearchResults, searchUsers } from '../actions'
import clearSearchResultsEpic from './clearSearchResults'

describe('clearSearchResults epic', () => {
  describe('when a search query is empty', () => {
    it('creates an action to clear the search results', () => {
      const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })

      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: searchUsers()
        })
        const state$ = null
        const output$ = clearSearchResultsEpic(action$, state$)

        expectObservable(output$).toBe('-a', {
          a: clearSearchResults()
        })
      })
    })
  })

  describe('when a search query is not empty', () => {
    it('does nothing', () => {
      const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected)
      })

      testScheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: searchUsers('jayphelps')
        })
        const state$ = null
        const output$ = clearSearchResultsEpic(action$, state$)

        expectObservable(output$).toBe('--')
      })
    })
  })
})
