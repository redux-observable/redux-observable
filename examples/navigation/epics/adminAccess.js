import { Observable } from 'rxjs/Observable';
import { push } from 'react-router-redux';
import * as ActionTypes from '../ActionTypes';
import { accessDenied } from '../actions';

export default function adminAccess(action$) {
  return action$.ofType(ActionTypes.CHECKED_ADMIN_ACCESS)
    // If you wanted to do an actual access check you
    // could do so here then filter by failed checks.
    .delay(2000)
    .mergeMap(() => Observable.merge(
      Observable.of(accessDenied()),
      Observable.timer(2000)
        .map(() => push('/'))
    ));
}
