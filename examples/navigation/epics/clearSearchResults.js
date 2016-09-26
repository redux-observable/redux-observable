import * as ActionTypes from '../ActionTypes';
import { clearSearchResults } from '../actions';

export default action$ =>
  action$.ofType(ActionTypes.SEARCHED_USERS_DEBOUNCED)
    .filter(action => !!!action.payload.query)
    .map(clearSearchResults);
