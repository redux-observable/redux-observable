# rx-ducks-middleware (alpha)

** WARNING: This module is purely experimental **

Creates [RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux).

- Dispatch a function that returns an observable of actions.
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
