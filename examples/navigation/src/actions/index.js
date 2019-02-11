export const SEARCHED_USERS = 'SEARCHED_USERS'
export const RECEIVED_USERS = 'RECEIVED_USERS'
export const CLEARED_SEARCH_RESULTS = 'CLEARED_SEARCH_RESULTS'

export const REQUESTED_USER_REPOS = 'REQUESTED_USER_REPOS'
export const RECEIVED_USER_REPOS = 'RECEIVED_USER_REPOS'

export const CHECKED_ADMIN_ACCESS = 'CHECKED_ADMIN_ACCESS'
export const ACCESS_DENIED = 'ACCESS_DENIED'

export const searchUsers = query => ({
  type: SEARCHED_USERS,
  payload: {
    query
  }
})

export const receiveUsers = users => ({
  type: RECEIVED_USERS,
  payload: {
    users
  }
})

export const clearSearchResults = () => ({
  type: CLEARED_SEARCH_RESULTS
})

export const requestReposByUser = user => ({
  type: REQUESTED_USER_REPOS,
  payload: {
    user
  }
})

export const receiveUserRepos = (user, repos) => ({
  type: RECEIVED_USER_REPOS,
  payload: {
    user,
    repos
  }
})

export const checkAdminAccess = () => ({
  type: CHECKED_ADMIN_ACCESS
})

export const accessDenied = () => ({
  type: ACCESS_DENIED
})
