import { merge } from 'rxjs/observable/merge';
import { LOCATION_CHANGE } from 'react-router-redux';
import { ajax } from 'rxjs/observable/dom/ajax';
import * as ActionTypes from '../ActionTypes';

// Hack since react-router-redux doesn't hook
// into react-router to grab parsed params.
const USER_PATTERN = /repos\/([a-zA-Z0-9_]+)/;

export default function fetchReposByUser(action$) {
  const fetchIntents$ = action$.ofType(LOCATION_CHANGE)
    .map(
      ({ payload }) => payload.pathname.match(USER_PATTERN)
    )
    .filter(match => !!match)
    .map(([, user]) => user);
  return merge(
    fetchIntents$.map(user => ({
      type: ActionTypes.REQUESTED_USER_REPOS,
      payload: {
        user
      }
    })),
    fetchIntents$
      .switchMap(user =>
        ajax.getJSON(`https://api.github.com/users/${user}/repos`)
          .map(res => ({
            type: ActionTypes.RECEIVED_USER_REPOS,
            payload: {
              repos: res,
              user
            }
          }))
      )
  );
}
