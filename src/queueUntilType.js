import { subscribeToResult } from 'rxjs/util/subscribeToResult';

export function queueUntilType(expectedType) {
  return this.lift(function(source) {
    let queue = [];
    let hasSeenType = false;
    const nullifyQueue = () => { queue = null; };

    const outer = {
      notifyNext: (_, action) => this.next(action),
      notifyComplete: nullifyQueue
    };
    return source.subscribe({
      next: action => {
        // It's important to check this first because of possible re-entry
        // before we've finished flushing the queue.
        if (hasSeenType) {
          return this.next(action);
        }

        if (action && action.type === expectedType) {
          hasSeenType = true;
          this.add(subscribeToResult(outer, queue));
          // no longer needed, free up memory
          nullifyQueue();
        } else {
          queue.push(action);
        }
      },
      error: e => this.error(e),
      complete: () => this.complete(),
      unsubscribe: nullifyQueue
    });
  });
}
