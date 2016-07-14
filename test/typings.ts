import { createEpicMiddleware, combineEpics, ActionsObservable } from '../index';
import { Action } from 'redux';
import { Observable } from 'rxjs/Observable';

const epic1 = (action$, store) =>
  action$.ofType('FIRST')
    .mapTo({
      type: 'first',
      payload: store.getState()
    });

const epic2 = (action$, store) =>
  action$.ofType('SECOND')
    .mapTo({
      type: 'second',
      payload: store.getState()
    });

const rootEpic = combineEpics(epic1, epic2);

createEpicMiddleware(rootEpic);

// should be a constructor that returns an observable
const actionsSubject = Observable.create(() => {});
const aoTest: Observable<Action> = new ActionsObservable(actionsSubject);
