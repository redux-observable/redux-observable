import "babel-polyfill"

import React from 'react';
import { render } from 'react-dom';
import { Provider, ReactRedux } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import * as actions from './actions';
import App from './components/App';
import { rootEpic } from './epics';
import { rootReducer }  from './reducers';

const epicMiddleware = createEpicMiddleware(rootEpic);

/**
 * The redux state store, built with the Epic middleware.
 */
const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware)
);

store.dispatch(actions.getAllProducts());

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
