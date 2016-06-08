import { combineReducers } from 'redux';
import { FETCH_USER_PENDING, FETCH_USER_FULFILLED, FETCH_USER_ABORTED } from '../actions';

const user = (state = { isLoading: false }, action) => {
  switch (action.type) {
    case FETCH_USER_PENDING:
      return { ...state, isLoading: true };

    case FETCH_USER_FULFILLED:
      return { ...state, isLoading: false, ...action.payload, timestamp: new Date() };

    case FETCH_USER_ABORTED:
      return { ...state, isLoading: false };

    default:
      return state;
  }
};

export default combineReducers({ user });
