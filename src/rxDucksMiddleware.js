import { Subject } from 'rxjs/Subject';

export function rxDucksMiddleware(transform) {
  let actions = new Subject();
  let send = new Subject();
  let subscription;

  let middleware = (store) => {
    return (next) => {
      send.subscribe(next);
      return (action) => {
        next(action);
        actions.next(action);
      };
    };
  };

  middleware.connect = () => {
    if (!subscription) {
      let transformer = transform(actions);
      subscription = transformer.subscribe(action => send.next(action));
    }
    return subscription;
  };

  middleware.unsubscribe = () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  };

  return middleware;
}
