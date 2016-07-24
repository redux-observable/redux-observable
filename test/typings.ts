import { createEpicMiddleware, Epic, combineEpics,
  EpicMiddleware, ActionsObservable } from '../index';
import { Action } from 'redux';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mapTo';

const epic1: Epic = (action$, store) =>
  action$.ofType('FIRST')
    .mapTo({
      type: 'first',
      payload: store.getState()
    });

const epic2: Epic = (action$, store) =>
  action$.ofType('SECOND')
    .mapTo({
      type: 'second',
      payload: store.getState()
    });

const epic3: Epic = action$ =>
  action$.ofType('THIRD')
    .mapTo({
      type: 'third'
    });

const epic4: Epic = () =>
  Observable.of({
    type: 'third'
  });

const rootEpic1: Epic = combineEpics(epic1, epic2, epic3, epic4);
const rootEpic2: Epic = combineEpics(epic1, epic2, epic3, epic4);

const epicMiddleware: EpicMiddleware = createEpicMiddleware(rootEpic1);

epicMiddleware.replaceEpic(rootEpic2);

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<Action> = new ActionsObservable(actionsSubject);
