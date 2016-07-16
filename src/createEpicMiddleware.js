import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable } from './ActionsObservable';

export function createEpicMiddleware(epic) {
  const actionsSubject = new Subject();
  const action$ = new ActionsObservable(actionsSubject);
  const epic$ = new BehaviorSubject(epic);

  const epicMiddleware = store => next => {
    epic$.filter(epic => typeof epic === 'function')
      .switchMap(epic => epic(action$, store))
      .subscribe(store.dispatch);

    return action => {
      if (typeof action === 'function') {
        if (typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
          console.warn('DEPRECATION: Using thunkservables with redux-observable is now deprecated in favor of the new "Epics" feature. See http://redux-observable.js.org/docs/FAQ.html#why-were-thunkservables-deprecated');
        }

        const out$ = from(action(action$, store));
        return out$.subscribe(store.dispatch);
      } else {
        const result = next(action);
        actionsSubject.next(action);
        return result;
      }
    };
  };

  epicMiddleware.replaceEpic = epic => {
    epic$.next(epic);
  };

  return epicMiddleware;
}
