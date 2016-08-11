import { LOCATION_CHANGE } from 'react-router-redux';
import * as ActionTypes from '../ActionTypes';

export default action$ =>
  action$.ofType(LOCATION_CHANGE)
    .filter(({ payload }) =>
      payload.pathname === '/' && !!!payload.query.q
    )
    .map(() => ({
      type: ActionTypes.CLEARED_RESULTS
    }));
