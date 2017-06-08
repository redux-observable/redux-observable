import { OuterSubscriber } from 'rxjs/OuterSubscriber';
import { subscribeToResult } from 'rxjs/util/subscribeToResult';


export function cacheUntilType(type) {
  return this.lift(new CacheUntilTypeOperator(type));
}

class CacheUntilTypeOperator {
  constructor(type) {
    this.actionType = type;
  }
  call(subscriber, source) {
    return source.subscribe(new CacheUntilTypeSubscriber(subscriber, this.actionType));
  }
}

class CacheUntilTypeSubscriber extends OuterSubscriber {
  constructor(destination, type) {
    super(destination);
    this.actionType = type;
    this.hasSeenType = false;
    this.buffer = [];
  }

  _next(action) {
    if (!this.hasSeenType) {
      if (action && action.type === this.actionType) {
        this.flush();
      } else {
        this.buffer.push(action);
      }
    } else {
      this.destination.next(action);
    }
  }

  notifyComplete() {
    this.buffer = null;
  }

  flush() {
    const actions = this.buffer;
    this.buffer = null;
    this.hasSeenType = true;
    this.add(subscribeToResult(this, actions));
  }
  _unsubscribe() {
    this.buffer = null;
  }
}
