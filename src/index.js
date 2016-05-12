import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';

export function reduxObservable() {
  let actions = new Subject();

  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action === 'function') {
        let obs = from(action(actions, store));
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
