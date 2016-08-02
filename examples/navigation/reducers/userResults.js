import * as ActionTypes from '../actionTypes';

const initialState = [];
export default function userResults(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.RECEIVED_USERS:
      return action.payload.users;
    case ActionTypes.CLEARED_RESULTS:
      return initialState;
    default:
      return state;
  }
}
