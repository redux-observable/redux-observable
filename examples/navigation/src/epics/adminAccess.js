import { push } from 'connected-react-router'
import { ofType } from 'redux-observable'
import { merge, of, timer } from 'rxjs'
import { delay, map, mergeMap } from 'rxjs/operators'
import { accessDenied, CHECKED_ADMIN_ACCESS } from '../actions'

const adminAccess = action$ =>
  action$.pipe(
    ofType(CHECKED_ADMIN_ACCESS),
    // If you wanted to do an actual access check you
    // could do so here then filter by failed checks.
    delay(2000),
    mergeMap(() =>
      merge(of(accessDenied()), timer(2000).pipe(map(() => push('/'))))
    )
  )

export default adminAccess
