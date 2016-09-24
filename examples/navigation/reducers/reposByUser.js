import * as ActionTypes from '../ActionTypes';

export default function reposByUser(state = {}, action) {
  switch (action.type) {
    case ActionTypes.REQUESTED_USER_REPOS:
      return Object.assign({}, state, {
        [action.payload.user]: undefined
      });
    case ActionTypes.RECEIVED_USER_REPOS:
      return Object.assign({}, state, {
        [action.payload.user]: action.payload.repos
      });
    default:
      return state;
  }
}
