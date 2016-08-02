import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import userResults from './userResults';
import searchInFlight from './searchInFlight';
import reposByUser from './reposByUser';

export default combineReducers({
  userResults,
  searchInFlight,
  reposByUser,
  routing: routerReducer
});
