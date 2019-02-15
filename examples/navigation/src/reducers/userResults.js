import { CLEARED_SEARCH_RESULTS, RECEIVED_USERS } from '../actions'

const initialState = []

const userResults = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVED_USERS:
      return action.payload.users
    case CLEARED_SEARCH_RESULTS:
      return initialState
    default:
      return state
  }
}

export default userResults
