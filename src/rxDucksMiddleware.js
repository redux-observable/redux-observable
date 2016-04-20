import { Subject } from 'rxjs/Subject';

/**
 * Creates middleware as well as input and output subjects that can be used to transform
 * actions in Redux. Intercepts actions and sends them to an output subject. Also hooks
 * the `next` middleware and provides an input subject
 * @returns {Object} a hash of `actions`, `send` and `middlware`.
 * - `actions`: An observable of actions inbound to the middleware
 * - `middleware`: The middlware handler itself, this is what you register with Redux
 * - `send`: An observer to send actions in order to continue processing the action
 */
export function rxDucksMiddleware() {
  const actions = new Subject();
  const send = new Subject();
  const middleware = (store) => (next) => {
    send.subscribe(next);
    return (action) => {
      actions.next(action);
    };
  };

  return { actions, send, middleware };
}
