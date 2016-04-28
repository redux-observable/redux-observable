import { Subject } from 'rxjs/Subject';

export function rxDucksMiddleware(transform) {
  let actions = new Subject();
  let send = new Subject();
  transform(actions).subscribe(send);

  let middleware = (store) => (next) => {
    send.subscribe(next);
    return (action) => {
      next(action);
      actions.next(action);
    };
  };

  return middleware;
}
