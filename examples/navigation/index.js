import 'rxjs';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './configureStore';
import App from './containers/App';
import UserSearch from './containers/UserSearch';
import ReposByUser from './containers/ReposByUser';
import Admin from './containers/Admin';

const store = configureStore();
const history = syncHistoryWithStore(
  browserHistory,
  store
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}>
        <IndexRoute component={UserSearch} />
        <Route path='repos/:user' component={ReposByUser} />
        <Route path='admin' component={Admin} />
      </Route>
    </Router>
  </Provider>,
  document.querySelector('.app')
);
