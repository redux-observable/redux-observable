import { createEpicMiddleware, Epic, combineEpics,
  EpicMiddleware, ActionsObservable } from '../index';
import { Action } from 'redux';
import { Observable } from 'rxjs/Observable';

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

const rootEpic1: Epic = combineEpics(epic1, epic2);
const rootEpic2: Epic = combineEpics(epic1, epic2);

const epicMiddleware: EpicMiddleware = createEpicMiddleware(rootEpic1);

epicMiddleware.replaceEpic(rootEpic2);

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<Action> = new ActionsObservable(actionsSubject);
