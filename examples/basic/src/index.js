import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configure-store';
import Example from './components/Example';

const store = configureStore();

render(
  <Provider store={store}>
    <Example />
  </Provider>,
  document.getElementById('app')
)