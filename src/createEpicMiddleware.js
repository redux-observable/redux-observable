import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable } from './ActionsObservable';

export function createEpicMiddleware(epic) {
  let actions = new Subject();
  let actionsObs = new ActionsObservable(actions);

  let middleware = (store) => (next) => {
    if (epic) {
      epic(actionsObs, store).subscribe(store.dispatch);
    }
    return (action) => {
      if (typeof action === 'function') {
        if (typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
          console.warn('DEPRECATION: Using thunkservables with redux-observable is now deprecated in favor of the new "Epics" feature. See http://redux-observable.js.org/docs/FAQ.html#why-were-thunkservables-deprecated');
        }

        let obs = from(action(actionsObs, store));
        let sub = obs.subscribe(store.dispatch);
        return sub;
      } else {
        let result = next(action);
        actions.next(action);
        return result;
      }
    };
  };

  return middleware;
}
