import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { ofType } from 'redux-observable';
import { mapTo } from 'rxjs/operators';

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
    mapTo({ type: 'PONG' })
  );

const epicMiddleware = createEpicMiddleware<Action, Action>();
const store = createStore(
  pingPongReducer,
  applyMiddleware(epicMiddleware)
);
epicMiddleware.run(combineEpics<Action, Action>(pingEpic));

store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'PING' });
