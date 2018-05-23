import { Observable, Subject } from 'rxjs';

// Used as a placeholder value so we can tell
// whether or not the real state has been set,
// even if the real state was `undefined`
export const UNSET_STATE_VALUE = {};

// We can't use BehaviorSubject because when we create
// and give state$ to your epics your reducers have not
// yet run, so there is no initial state yet until the
// `@@redux/INIT` action is emitted. BehaviorSubject
// requires an initial value (which would be undefined)
// and if an epic subscribes to it on app boot it would
// synchronously emit that undefined value incorrectly.
// We could use ReplaySubject to get that behavior, but
// then it wouldn't have the .value property.
// We also don't want to expose any Subject to the user at
// all because then they could do `state$.next()` and
// screw things up and it would just be a footgun.
// This also allows us to add a warning message for
// accessing the state$.value property before redux
// has initialized.
export class StateObservable extends Observable {
  constructor(stateSubject) {
    super(subscriber => {
      const subscription = this.__notifier.subscribe(subscriber);
      if (this.__value !== UNSET_STATE_VALUE && subscription && !subscription.closed) {
        subscriber.next(this.__value);
      }
      return subscription;
    });

    this.__value = UNSET_STATE_VALUE;
    this.__notifier = new Subject();
    this.__subscription = stateSubject.subscribe(value => {
      // We only want to update state$ if it has actually changed since
      // redux requires reducers use immutability patterns.
      // This is basically what distinctUntilChanged() does but it's so simple
      // we don't need to pull that code in
      if (value !== this.__value) {
        this.__value = value;
        this.__notifier.next(value);
      }
    });
  }

  get value() {
    if (this.__value === UNSET_STATE_VALUE) {
      if (process.env.NODE_ENV !== 'production') {
        require('./utils/console').warn('You accessed state$.value inside one of your Epics, before your reducers have run for the first time, so there is no state yet. You\'ll need to wait until after the first action (@@redux/INIT) is dispatched or by using state$ as an Observable.');
      }
      return undefined;
    } else {
      return this.__value;
    }
  }
}
