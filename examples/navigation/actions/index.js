import * as ActionTypes from '../ActionTypes';

export function searchUsers(query) {
  return {
    type: ActionTypes.SEARCHED_USERS,
    payload: {
      query
    }
  };
}

export function receiveUsers(users) {
  return {
    type: ActionTypes.RECEIVED_USERS,
    payload: {
      users
    }
  };
}

export function clearSearchResults() {
  return {
    type: ActionTypes.CLEARED_SEARCH_RESULTS
  };
}

export function requestReposByUser(user) {
  return {
    type: ActionTypes.REQUESTED_USER_REPOS,
    payload: {
      user
    }
  };
}

export function receiveUserRepos(user, repos) {
  return {
    type: ActionTypes.RECEIVED_USER_REPOS,
    payload: {
      user,
      repos
    }
  };
}

export function checkAdminAccess() {
  return {
    type: ActionTypes.CHECKED_ADMIN_ACCESS
  };
}

export function accessDenied() {
  return {
    type: ActionTypes.ACCESS_DENIED
  };
}
