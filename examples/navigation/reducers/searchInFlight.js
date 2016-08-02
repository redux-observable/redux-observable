import * as ActionTypes from '../actionTypes';

export default function searchInFlight(state = false, action) {
  switch (action.type) {
    case ActionTypes.SEARCHED_USERS:
      return true;
    case ActionTypes.RECEIVED_USERS:
    case ActionTypes.CLEARED_RESULTS:
    case ActionTypes.SEARCHED_USERS_FAILED:
      return false;
    default:
      return state;
  }
}
