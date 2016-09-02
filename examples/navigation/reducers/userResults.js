import * as ActionTypes from '../ActionTypes';

const initialState = [];
export default function userResults(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.RECEIVED_USERS:
      return action.payload.users;
    case ActionTypes.CLEARED_SEARCH_RESULTS:
      return initialState;
    default:
      return state;
  }
}
