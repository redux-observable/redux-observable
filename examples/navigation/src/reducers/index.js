import { connectRouter } from 'connected-react-router'
import { combineReducers } from 'redux'
import adminAccess from './adminAccess'
import reposByUser from './reposByUser'
import searchInFlight from './searchInFlight'
import userResults from './userResults'

export default history =>
  combineReducers({
    userResults,
    searchInFlight,
    reposByUser,
    adminAccess,
    router: connectRouter(history)
  })
