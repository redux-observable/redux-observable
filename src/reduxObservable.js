import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable } from './ActionsObservable';

const DEFAULT_OPTIONS = {};

export function reduxObservable({ extraArguments = [] } = DEFAULT_OPTIONS) {
  let actions = new Subject();
  let actionsObs = new ActionsObservable(actions);

  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action === 'function') {
        let obs = from(action(actionsObs, store, ...extraArguments));
        let sub = obs.subscribe(store.dispatch);
        return sub;
      } else {
        actions.next(action);
        return next(action);
      }
    };
  };

  return middleware;
}
