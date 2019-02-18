import { routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import rootEpic from '../epics'
import rootReducer from '../reducers'

export const history = createBrowserHistory()

const epicMiddleware = createEpicMiddleware()

const configureStore = () => {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(
    rootReducer(history),
    composeEnhancers(applyMiddleware(epicMiddleware, routerMiddleware(history)))
  )

  epicMiddleware.run(rootEpic)

  return store
}

export default configureStore
