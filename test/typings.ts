import { createEpicMiddleware, Epic, combineEpics,
  EpicMiddleware, ActionsObservable } from '../index';
import { Action, createStore, applyMiddleware } from 'redux';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';

const epic1: Epic = (action$, store) =>
  action$.ofType('FIRST')
    .mapTo({
      type: 'first',
      payload: store.getState()
    });

const epic2: Epic = (action$, store) =>
  action$.ofType('SECOND')
    .mapTo('second')
    .mergeMap(type => Observable.of({ type }));

const epic3: Epic = action$ =>
  action$.ofType('THIRD')
    .mapTo({
      type: 'third'
    });

const epic4: Epic = () =>
  Observable.of({
    type: 'fourth'
  });

const rootEpic1: Epic = combineEpics(epic1, epic2, epic3, epic4);
const rootEpic2: Epic = combineEpics(epic1, epic2, epic3, epic4);

const epicMiddleware: EpicMiddleware = createEpicMiddleware(rootEpic1);

epicMiddleware.replaceEpic(rootEpic2);

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<Action> = new ActionsObservable(actionsSubject);

const reducer = (state = [], action) => state.concat(action);
const store = createStore(
  reducer,
  applyMiddleware(epicMiddleware)
);

store.dispatch({ type: 'FIRST' });
store.dispatch({ type: 'SECOND' });
