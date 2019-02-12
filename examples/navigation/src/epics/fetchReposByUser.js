import { ofType } from 'redux-observable'
import { ajax } from 'rxjs/ajax'
import { map, switchMap } from 'rxjs/operators'
import { receiveUserRepos, REQUESTED_USER_REPOS } from '../actions'

const fetchReposByUser = action$ =>
  action$.pipe(
    ofType(REQUESTED_USER_REPOS),
    map(action => action.payload.user),
    switchMap(user =>
      ajax
        .getJSON(`https://api.github.com/users/${user}/repos`)
        .pipe(map(repos => receiveUserRepos(user, repos)))
    )
  )

export default fetchReposByUser
