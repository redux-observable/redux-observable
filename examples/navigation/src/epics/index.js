import { combineEpics } from 'redux-observable'
import adminAccess from './adminAccess'
import clearSearchResults from './clearSearchResults'
import fetchReposByUser from './fetchReposByUser'
import searchUsers from './searchUsers'

export default combineEpics(
  searchUsers,
  clearSearchResults,
  fetchReposByUser,
  adminAccess
)
