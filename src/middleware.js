import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';

export function reduxObservable() {
  let actions = new Subject();

  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action === 'function') {
        let obs = from(action(actions, store));
        let sub = obs.subscribe(next);
        actions.next(action);
        return sub;
      } else {
        return next(action);
      }
    };
  };

  return middleware;
}
