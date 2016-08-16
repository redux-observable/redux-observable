import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import userResults from './userResults';
import searchInFlight from './searchInFlight';
import reposByUser from './reposByUser';
import adminAccess from './adminAccess';

export default combineReducers({
  userResults,
  searchInFlight,
  reposByUser,
  adminAccess,
  routing: routerReducer
});
