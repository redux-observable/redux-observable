import * as Rx from 'rxjs';

export const FETCH_USER_PENDING = 'FETCH_USER_PENDING';
export const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';
export const FETCH_USER_ABORTED = 'FETCH_USER_ABORTED';

export const fetchUser = () => (
  (actions, store) => Rx.Observable.of({ id: 1, name: 'Bilbo Baggins', timestamp: new Date() })
    // Delaying to emulate an async request, like Rx.Observable.ajax('/api/path')
    .delay(1000)
    // When our request comes back, we transform it into an action
    // that is then automatically dispatched by the middleware
    .map(
      payload => ({ type: FETCH_USER_FULFILLED, payload })
    )
    // Abort fetching the user if someone dispatches an abort action
    .takeUntil(
      actions.filter(action => action.type === FETCH_USER_ABORTED)
    )
    // Let's us immediately update the user's state so we can display
    // loading messages to the user, etc.
    .startWith({ type: FETCH_USER_PENDING })
);

// Plain old action
export const abortFetchUser = () => ({ type: FETCH_USER_ABORTED });
