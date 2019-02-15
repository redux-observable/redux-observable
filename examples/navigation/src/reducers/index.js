import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import adminAccess from './adminAccess'
import reposByUser from './reposByUser'
import searchInFlight from './searchInFlight'
import userResults from './userResults'

export default combineReducers({
  userResults,
  searchInFlight,
  reposByUser,
  adminAccess,
  routing: routerReducer
})
