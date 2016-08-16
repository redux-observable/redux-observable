import { Observable } from 'rxjs/Observable';
import { replace } from 'react-router-redux';
import * as ActionTypes from '../ActionTypes';
import { receiveUsers } from '../actions';
import { ajax } from 'rxjs/observable/dom/ajax';

export default function searchUsers(action$) {
  const searchIntents$ = action$.ofType(ActionTypes.SEARCHED_USERS)
    .map(action => action.payload.query)
    .filter(q => !!q);
  return searchIntents$
    .switchMap(q => Observable.timer(800)
      .takeUntil(action$.ofType(ActionTypes.CLEARED_SEARCH_RESULTS))
      .mergeMap(() => Observable.merge(
        Observable.of(replace(`?q=${q}`)),
        ajax.getJSON(`https://api.github.com/search/users?q=${q}`)
          .map(res => res.items)
          .map(receiveUsers)
      ))
    );
};
