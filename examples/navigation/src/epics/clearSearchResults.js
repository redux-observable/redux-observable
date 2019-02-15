import { ofType } from 'redux-observable'
import { filter, map } from 'rxjs/operators'
import {
  clearSearchResults as clearSearchResultsAction,
  SEARCHED_USERS
} from '../actions'

const clearSearchResults = action$ =>
  action$.pipe(
    ofType(SEARCHED_USERS),
    filter(action => !!!action.payload.query),
    map(clearSearchResultsAction)
  )

export default clearSearchResults
