import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { reduxObservable } from 'redux-observable';
import rootReducer from './reducers';
import Example from './components/Example';

const store = createStore(rootReducer, applyMiddleware(reduxObservable()));

render(
  <Provider store={store}>
    <Example />
  </Provider>,
  document.getElementById('app')
)