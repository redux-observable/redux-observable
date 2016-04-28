import { Subject } from 'rxjs/Subject';

export function rxDucksMiddleware(transform) {
  let actions = new Subject();
  let middleware = (store) => (next) => {
    return (action) => {
      if (typeof action.async === 'function') {
        let observable = action.async(actions);
        return observable.subscribe(next);
      }
      return next(action);
    };
  };

  return middleware;
}
