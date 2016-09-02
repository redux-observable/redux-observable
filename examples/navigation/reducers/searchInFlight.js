import * as ActionTypes from '../ActionTypes';

export default function searchInFlight(state = false, action) {
  switch (action.type) {
    case ActionTypes.SEARCHED_USERS:
      return true;
    case ActionTypes.RECEIVED_USERS:
    case ActionTypes.CLEARED_SEARCH_RESULTS:
      return false;
    default:
      return state;
  }
}
