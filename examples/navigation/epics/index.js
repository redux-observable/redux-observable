import { combineEpics } from 'redux-observable';
import searchUsersDebounced from './searchUsersDebounced';
import searchUsers from './searchUsers';
import clearSearchResults from './clearSearchResults';
import fetchReposByUser from './fetchReposByUser';
import adminAccess from './adminAccess';

export default combineEpics(
  searchUsersDebounced,
  searchUsers,
  clearSearchResults,
  fetchReposByUser,
  adminAccess
);
