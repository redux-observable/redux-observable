import { RECEIVED_USER_REPOS, REQUESTED_USER_REPOS } from '../actions'

const reposByUser = (state = {}, action) => {
  switch (action.type) {
    case REQUESTED_USER_REPOS:
      return Object.assign({}, state, {
        [action.payload.user]: undefined
      })
    case RECEIVED_USER_REPOS:
      return Object.assign({}, state, {
        [action.payload.user]: action.payload.repos
      })
    default:
      return state
  }
}

export default reposByUser
