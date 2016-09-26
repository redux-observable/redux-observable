import * as ActionTypes from '../ActionTypes';
import { searchedUsers } from '../actions';

export default function searchUsersDebounced(action$) {
  return action$.ofType(ActionTypes.SEARCHED_USERS_DEBOUNCED)
    .debounceTime(800)
    .map(action => searchedUsers(action.payload.query));
};
