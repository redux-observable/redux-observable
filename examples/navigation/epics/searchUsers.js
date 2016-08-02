import { Observable } from 'rxjs';
import { LOCATION_CHANGE } from 'react-router-redux';
import { ajax } from 'rxjs/observable/dom/ajax';
import * as ActionTypes from '../actionTypes';

export default function searchUsers(action$) {
  const searchIntents$ = action$.ofType(LOCATION_CHANGE)
    .filter(({ payload }) =>
      payload.pathname === '/' && !!payload.query.q
    );
  return Observable.merge(
    searchIntents$.map(() => ({
      type: ActionTypes.SEARCHED_USERS
    })),
    searchIntents$
      .switchMap(({ payload: { query: { q } } }) =>
        Observable.timer(800) // debouncing
          .takeUntil(action$.ofType(ActionTypes.CLEARED_RESULTS))
          .mergeMapTo(ajax.getJSON(`https://api.github.com/search/users?q=${q}`))
          .map(res => ({
            type: ActionTypes.RECEIVED_USERS,
            payload: {
              users: res.items
            }
          }))
      )
  );
};
