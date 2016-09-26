import { Observable } from 'rxjs/Observable';
import { replace } from 'react-router-redux';
import * as ActionTypes from '../ActionTypes';
import { receiveUsers } from '../actions';
import { ajax } from 'rxjs/observable/dom/ajax';

export default function searchUsers(action$) {
  return action$.ofType(ActionTypes.SEARCHED_USERS)
    .map(action => action.payload.query)
    .filter(q => !!q)
    .switchMap(q =>
      ajax.getJSON(`https://api.github.com/search/users?q=${q}`)
        .takeUntil(action$.ofType(ActionTypes.CLEARED_SEARCH_RESULTS))
        .map(res => receiveUsers(res.items))
        .startWith(replace(`?q=${q}`)));
};
