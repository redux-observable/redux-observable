import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable } from './ActionsObservable';
import $$observable from 'symbol-observable';

export function reduxObservable(processor) {
  let actions = new Subject();
  let actionsObs = new ActionsObservable(actions);

  let middleware = (store) => (next) => {
    if (processor) {
      processor(actionsObs, store).subscribe(store.dispatch);
    }
    return (action) => {
      if (action) {
        if (typeof action.thunk === 'function') {
          let obs = from(action.thunk(actionsObs, store));
          let sub = obs.subscribe(store.dispatch);
          return sub;
        }
        if (typeof action === 'function' && typeof action.subscribe === 'function' || action[$$observable]) {
          let obs = from(action);
          let sub = obs.subscribe(store.dispatch);
          return sub;
        }
      }
      let result = next(action);
      actions.next(action);
      return result;
    };
  };

  return middleware;
}
