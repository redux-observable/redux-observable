import { ConnectedRouter } from 'connected-react-router'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router'
import Admin from './containers/Admin'
import ReposByUser from './containers/ReposByUser'
import UserSearch from './containers/UserSearch'
import configureStore, { history } from './store/configureStore'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={UserSearch} />
        <Route path="/repos/:user" component={ReposByUser} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
