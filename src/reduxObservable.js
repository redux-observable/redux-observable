import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';
import { ActionsObservable } from './ActionsObservable';

export function reduxObservable(processor) {
  let actions = new Subject();
  let actionsObs = new ActionsObservable(actions);

  let middleware = (store) => (next) => {
    if (processor) {
      processor(actionsObs, store).subscribe(store.dispatch);
    }
    return (action) => {
      if (typeof action === 'function') {
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
