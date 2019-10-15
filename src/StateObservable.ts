import { Observable, Subject, Subscription } from 'rxjs';

export class StateObservable<S> extends Observable<S> {
  value: S;
  // TODO: This property is never accessed, should it be removed?
  // @ts-ignore
  private __subscription: Subscription;
  private __notifier = new Subject<S>();

  constructor(stateSubject: Subject<S>, initialState: S) {
    super(subscriber => {
      const subscription = this.__notifier.subscribe(subscriber);
      if (subscription && !subscription.closed) {
        subscriber.next(this.value);
      }
      return subscription;
    });

    this.value = initialState;
    this.__subscription = stateSubject.subscribe(value => {
      // We only want to update state$ if it has actually changed since
      // redux requires reducers use immutability patterns.
      // This is basically what distinctUntilChanged() does but it's so simple
      // we don't need to pull that code in
      if (value !== this.value) {
        this.value = value;
        this.__notifier.next(value);
      }
    });
  }
}
