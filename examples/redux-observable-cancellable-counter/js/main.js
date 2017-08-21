/**
 * The new saga that uses redux observable.
 */
import "babel-polyfill"

import React from 'react'
import { render } from 'react-dom'
import { Provider, ReactRedux } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import reducer from './reducers'
import Counter from './components/Counter'
import 'rxjs';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './epics';

const epicMiddleware = createEpicMiddleware(rootEpic);

/**
 * this is the Redux state store.
 */
const store = createStore(
  reducer,
  applyMiddleware(epicMiddleware)
);

render(
  <Provider store={store}>
    <Counter />
  </Provider>,
  document.getElementById('root')
);
