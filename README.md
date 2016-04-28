# rx-ducks-middleware (alpha)

** WARNING: This module is purely experimental **

Creates [RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Basically, this intercepts actions via
middleware and sends them out through an observable, and provides an observer that
can be used to send an action back along your chain of middleware on its way to
the reducer.

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
import { createStore, applyMiddleware } from 'redux';
import rxDucksMiddleware from 'rx-ducks-middleware';
import { autobind } from 'core-decorators';
import * as Rx from 'rxjs';


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

const store = createStore(reducer, applyMiddleware(rxDucksMiddleware()));

export default class MyComponent extends Component {

  @autobind
  loadData() {
    this.props.store.dispatch({
      type: 'LOAD_DATA',
      async: (actions) => Observable.ajaxGet('some/data/url')
                          .map(data => ({ type: 'DATA_LOADED', data }))
                          .startWith({ type: 'DATA_LOADING' })
                          .takeUntil(actions.filter(({ type }) => type === 'ABORT_LOAD'))
    })
  }

  componentDidMount() {
    const { store } = this.props;
    store.subscribe(() => this.setState(this.getState()));
  }

  @autobind
  abortLoad() {
    this.props.store.dispatch({ type: 'ABORT_LOAD' });
  }

  render() {
    const { loading, data } = this.state;
    return (<div>
      <button onClick={this.loadData}>load data</button>
      <button onClick={this.abortLoad}>abort load</button>
      <div>Loading: {loading}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>);
  }
}
```
