# redux-observable (beta)

Creates [RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux).

- Dispatch a function that returns an observable of actions, a promise of action or iterable of actions.
- Function is provided a stream of all actions, useful for composition with the current dispatched observable
  (think things like `takeUntil` or `zip`)
- Function is also provided a reference to the store which can be used to get the state or even dispatch.

## Install

NOTE: This has a peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed
as well.

```sh
npm i -S rx-ducks-middleware
```

## Usage

## Basic

With rxDucksMiddleware, you can dispatch any function that returns an observable,
a promise, an observable-like object or an iterable. The basic call looks like:

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
}()))
```

### Cancellation

It's recommended to dispatch an action to cancel your async action with Rx. This can be done
by leveraging the first argument to your dispatched function, which returns all `actions`. With that
you can use `takeUntil` to abort the async action cleanly and via composition.

```js
dispatch((actions) => Observable.timer(1000)
  .map(() => ({ type: 'TIMER_COMPLETE'}))
  .takeUntil(actions.filter(a => a.type === 'ABORT_TIMER')))

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

Below is a basic example of it how it might work in React.

```js
import { Component } from 'react';
import { connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from 'rx-ducks-middleware';
import * as Rx from 'rxjs';

// Just the plain redux reducer.
const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'DATA_LOADING':
      return { ...state, loading: true };
    case 'DATA_LOADED':
      return { ...state, loading: false, data: action.data };
    case 'ABORT_LOAD':
      return { ...state, loading: false };
  }
  return state;
};

// making a store
const store = createStore(reducer, applyMiddleware(rxDucksMiddleware()));

// HERE BE THE DUCKS
const loadData = () => (actions, store) => Observable.of('hello world')
                .delay(1000)
                .map(data => ({ type: 'DATA_LOADED', data })
                .startWith({ type: 'DATA_LOADING' })
                .takeUntil(actions.filter(a => a.type === 'ABORT_LOAD'));

// plain old action
const abortLoad = () => ({ type: 'ABORT_LOAD' });

const mapStateToProps = ({ data, loading }) => ({ data, loading });

const mapDispatchToProps = (dispatch) => ({
  loadData: () => dispatch(loadData()),
  abortLoad: () => dispatch(abortLoad())
});

const MyComponent = ({ loading, data, loadData, abortLoad }) => (
  <div>
    <button onClick={loadData}>load data</button>
    <button onClick={abortLoad}>abort load</button>
    <div>Loading: {loading}</div>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

:shipit:
