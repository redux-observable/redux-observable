import { replace } from 'connected-react-router'
import { ofType } from 'redux-observable'
import { merge, of, timer } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators'
import {
  CLEARED_SEARCH_RESULTS,
  receiveUsers,
  SEARCHED_USERS
} from '../actions'

const searchUsers = action$ =>
  action$.pipe(
    ofType(SEARCHED_USERS),
    map(action => action.payload.query),
    filter(q => !!q),
    switchMap(q =>
      // debounce
      timer(800).pipe(
        takeUntil(action$.pipe(ofType(CLEARED_SEARCH_RESULTS))),
        mergeMap(() =>
          merge(
            of(replace(`?q=${q}`)),
            ajax.getJSON(`https://api.github.com/search/users?q=${q}`).pipe(
              map(res => res.items),
              map(receiveUsers)
            )
          )
        )
      )
    )
  )

export default searchUsers
