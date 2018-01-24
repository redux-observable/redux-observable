import { Subject } from 'rxjs/Subject';

// Used as a placeholder value so we can tell
// whether or not the real state has been set,
// even if the real state was `undefined`
const UNSET_VALUE = {};

// We can't use BehaviorSubject because when we create
// and give state$ to your epics your reducers have not
// yet run, so there is no initial state yet until the
// `@@redux/INIT` action is emitted. BehaviorSubject
// requires an initial value (which would be undefined)
// and if an epic subscribes to it on app boot it would
// synchronously emit that undefined value incorrectly.
export class StateSubject extends Subject {
  constructor(store) {
    super();
    // If you're reading this, keep in mind that this is
    // NOT part of the public API and will be removed!
    this.__store = store;
    this._value = UNSET_VALUE;
  }

  _subscribe(subscriber) {
    const subscription = super._subscribe(subscriber);
    if (this._value !== UNSET_VALUE && subscription && !subscription.closed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  get value() {
    if (this._value === UNSET_VALUE) {
      if (process.env.NODE_ENV !== 'production') {
        require('./utils/console').warn('You accessed state$.value inside one of your Epics, before your reducers have run for the first time, so there is no state yet. You\'ll need to wait until after the first action (@@redux/INIT) is dispatched or by using state$ as an Observable.');
      }
      return undefined;
    } else {
      return this._value;
    }
  }

  next(value) {
    this._value = value;
    return super.next(value);
  }
}

StateSubject.prototype.getState = function () {
  if (process.env.NODE_ENV !== 'production') {
    require('./utils/console').deprecate('calling store.getState() in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateSubject), instead of the store. To imperatively get the current state use state$.value instead of getState(). Alternatively, since it\'s now a stream you can compose and react to state changes.\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateSubject<S>, dependencies?: D): Observable<R>\n\nLearn more: https://goo.gl/WWNYSP');
  }
  return this.value;
};

StateSubject.prototype.dispatch = function (action) {
  if (process.env.NODE_ENV !== 'production') {
    require('./utils/console').deprecate('calling store.dispatch() directly in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateSubject), instead of the store. Instead of calling store.dispatch() in your Epic, emit actions through the Observable your Epic returns\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateSubject<S>, dependencies?: D): Observable<R>\n\nLearn more: https://goo.gl/WWNYSP');
  }
  return this.__store.dispatch(action);
};
