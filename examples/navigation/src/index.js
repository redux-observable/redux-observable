import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory, IndexRoute, Route, Router } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Admin from './containers/Admin'
import App from './containers/App'
import ReposByUser from './containers/ReposByUser'
import UserSearch from './containers/UserSearch'
import configureStore from './store/configureStore'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={UserSearch} />
        <Route path="repos/:user" component={ReposByUser} />
        <Route path="admin" component={Admin} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
