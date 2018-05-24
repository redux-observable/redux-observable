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
// We also don't want to expose a Subject to the user at
// all because then they could do `state$.next()` and
// screw things up and it would just be a footgun.
export class StateObservable extends Observable {
  constructor(stateSubject, store) {
    super(subscriber => {
      const subscription = this.__notifier.subscribe(subscriber);
      if (this.__value !== UNSET_STATE_VALUE && subscription && !subscription.closed) {
        subscriber.next(this.__value);
      }
      return subscription;
    });

    // If you're reading this, keep in mind that this is
    // NOT part of the public API and will be removed!
    this.__store = store;
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

  getState() {
    if (process.env.NODE_ENV !== 'production') {
      require('./utils/console').deprecate('calling store.getState() in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateObservable), instead of the store. To imperatively get the current state use state$.value instead of getState(). Alternatively, since it\'s now a stream you can compose and react to state changes.\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateObservable<S>, dependencies?: D): Observable<R>\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    }
    return this.__value;
  }

  dispatch(...args) {
    if (process.env.NODE_ENV !== 'production') {
      require('./utils/console').deprecate('calling store.dispatch() directly in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateObservable), instead of the store. Instead of calling store.dispatch() in your Epic, emit actions through the Observable your Epic returns.\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateObservable<S>, dependencies?: D): Observable<R>\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    }
    return this.__store.dispatch(...args);
  }
}
