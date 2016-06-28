<img title="logo" src="logo/logo-small.gif" width="128" style="vertical-align: middle;">
<img title="redux-observable" src="logo/logo-text-small.png" width="526" style="vertical-align: middle; margin-left: 20px; margin-top: -13px;">

[![build status](https://img.shields.io/travis/reactjs/redux/master.svg?style=flat-square)](https://travis-ci.org/redux-observable/redux-observable)
[![npm version](https://img.shields.io/npm/v/redux-observable.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![npm downloads](https://img.shields.io/npm/dm/redux-observable.svg?style=flat-square)](https://www.npmjs.com/package/redux)

[RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Compose and cancel async actions and more.

### Warning: we've recently introduced a new "Process Manager" feature that will soon _replace_ the thunk-style documented below. Extensive documentation on this is in the works, subscribe to [Issue #44](https://github.com/redux-observable/redux-observable/issues/44) to be notified when they are up!

- Dispatch a function that returns an observable of actions, a promise of action or iterable of actions.
- Function is provided a stream of all future actions, useful for composition with the current dispatched observable, especially for cancellation.
  (think things like `takeUntil` or `zip`)
- Function is also provided a reference to the store which can be used to get the state or even dispatch.

[Read about it on Medium](https://medium.com/@benlesh/redux-observable-ec0b00d2eb52)

## Install

NOTE: This has a peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed
as well.

```sh
npm install --save redux-observable
```

## Usage

### Basic

Add the middlware to your redux store:

```js
import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';

const store = createStore(
  rootReducer,
  // Notice that we invoke `reduxObservable()` before passing it!
  applyMiddleware(reduxObservable())
);

```

With redux-observable, you can dispatch any function that returns an observable,
a promise, an observable-like object or an iterable; we call this a "thunkservable".

Your thunkservable emits a stream of actions.

Here are several examples:

```js
// using RxJS
dispatch(() => Rx.Observable.of({ type: 'ASYNC_ACTION_FROM_RX' }).delay(1000));
// using a Promise
dispatch(() => Promise.resolve({ type: 'ASYNC_ACTION_FROM_PROMISE'}));
// using an Array of actions
dispatch(() => [{ type: 'ACTION_1' }, { type: 'ACTION_2' }]);
// using a generator of actions
dispatch(() => (function* () {
  for (let i = 0; i < 10; i++) {
    yield { type: 'SOME_GENERATED_ACTION', value: i };
  }
}()));
```

Of course, you'll usually create action factories instead:

```js
const asyncAction = () => (
  (actions, store) => Rx.Observable.of({ type: 'ASYNC_ACTION_FROM_RX' }).delay(1000)
);

dispatch(asyncAction());

const fetchUserById = (userId) => (
  (actions) => (
    Rx.Observable.ajax(`/api/users/${userId}`)
      .map(
        (payload) => ({ type: 'FETCH_USER_FULFILLED', payload })
      )
      .startWith({ type: 'FETCH_USER_PENDING' })
  )
);

dispatch(fetchUserById(123));

// If you find it more readable, you certainly can omit all those
// arrow function parenthesis (or use regular functions)

const fetchUserById = userId =>
  actions =>
    Rx.Observable.ajax(`/api/users/${userId}`)
      .map(payload => ({ type: 'FETCH_USER_FULFILLED', payload }))
      .startWith({ type: 'FETCH_USER_PENDING' });

```

#### Cancellation

It's recommended to dispatch an action to cancel your async action with Rx. This can be done
by leveraging the first argument to your dispatched function, which returns an observable of all `actions`.
This observable is an instanceof `ActionObservable` and has a custom operator `ofType`. The `ofType`
operator can be used to filter down to a set of actions of a particular type. It is essentially an alias
for `filter(action.type === 'SOME_TYPE')`. You can use this stream of all actions with operators like
`takeUntil` to abort the async action cleanly and via composition.

```js
dispatch(
  (actions) => Observable.timer(1000)
    .map(() => ({ type: 'TIMER_COMPLETE'}))
    .takeUntil(
      actions.ofType('ABORT_TIMER')
    )
    // `actions.ofType('ABORT_TIMER')` is equivalent to
    // `actions.filter(action => action.type === 'ABORT_TIMER')`
);

// elsewhere in your code you can abort with a simple dispatch
dispatch({ type: 'ABORT_TIMER' });
```

You can also cancel an async dispatch by using the return value from your dispatch, which is an
Rx Subscription. This works well for other types that don't have cancellation, like promises, but
internally will really use "disinterest" to stop the resolved value from propagating.

```js
let subscription = dispatch(() => Promise.resolve({ type: 'DELAYED_ACTION' }));

// will stop DELAYED_ACTION from firing
subscription.unsubscribe();
```

### Other API Notes

The second argument to your dispatched function will be the `store` instance itself. This gives you
the ability to `getState()` on your store in case you need to assert some condition before dispatching your
next async message. It also gives you the ability to `dispatch()` explicitly.

### Basic Dispatch Type Signature

If it helps to think about it this way, in a TypeScript-style type definition, the dispatch function would
look like this when used to dispatch an action asynchronously:

```TypeScript
dispatch = ((actions?: Observable<Action>, store?: ReduxStore) => Observable<Action>) => Subscription;
```

### Example

A full example is available in [examples/basic](examples/basic)

* * *

##### Incompatible w/ redux-thunk

Since redux-observable uses dispached functions, this middlware is *incompatible with redux-thunk*. At this time, this is unavoidable since providing the function a stream of future actions for cancellation is imperative.

:shipit:
