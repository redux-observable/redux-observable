import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { ofType } from 'redux-observable';
import { map } from 'rxjs/operators';

// Actions
type Action = { type: 'PING' } | { type: 'PONG' };

// Reducer
function pingPongReducer(state = { isPinging: false }, action: Action) {
  switch (action.type) {
    case 'PING':
      return { isPinging: true };
    case 'PONG':
      return { isPinging: false };
    default:
      return state;
  }
}

// Epics
import type { Epic } from 'redux-observable';

const pingEpic: Epic<Action, Action> = (action$) =>
  action$.pipe(
    ofType('PING'),
    map(() => ({ type: 'PONG' }))
  );

const epicMiddleware = createEpicMiddleware<Action, Action>();
const store = configureStore({
  reducer: pingPongReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(epicMiddleware),
});
epicMiddleware.run(combineEpics<Action, Action>(pingEpic));

store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'PING' });
