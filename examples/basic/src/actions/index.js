import * as Rx from 'rxjs';

export const FETCH_USER_PENDING = 'FETCH_USER_PENDING';
export const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';
export const FETCH_USER_ABORTED = 'FETCH_USER_ABORTED';
const BASE_URL = 'http://localhost:3000/user/';

export const fetchUser = () => (
  (actions, store) => Rx.Observable.ajax.getJSON(BASE_URL)
    // When our request comes back, we transform it into an action
    // which the redux-observable middleware will then dispatch
    .map(
      payload => ({ type: FETCH_USER_FULFILLED, payload })
    )
    // Abort fetching the user if someone dispatches an abort action
    .takeUntil(
      actions.ofType(FETCH_USER_ABORTED)
    )
    // Let's us immediately update the user's state so we can display
    // loading messages to the user, etc.
    .startWith({ type: FETCH_USER_PENDING })
);

// Plain old action
export const abortFetchUser = () => ({ type: FETCH_USER_ABORTED });
