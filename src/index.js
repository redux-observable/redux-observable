import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable as Actions } from './actions-observable';

export function reduxObservable() {
  let actions = new Subject();
  let actionsObs = new Actions(actions);

  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action === 'function') {
        let obs = from(action(actionsObs, store));
        let sub = obs.subscribe(next);
        return sub;
      } else {
        actions.next(action);
        return next(action);
      }
    };
  };

  return middleware;
}

export const ActionsObservable = Actions;
