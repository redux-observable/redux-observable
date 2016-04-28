import { Subject } from 'rxjs/Subject';

export function rxDucksMiddleware() {
  let actions = new Subject();

  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action === 'function') {
        let obs = action(actions, store);
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
