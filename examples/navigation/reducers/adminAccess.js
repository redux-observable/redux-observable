import * as ActionTypes from '../ActionTypes';

const DENIED = 'DENIED';

export default function adminAccess(state = null, action) {
  switch (action.type) {
    case ActionTypes.ACCESS_DENIED:
      return DENIED;
    default:
      return state;
  }
}
