import { push, LOCATION_CHANGE } from 'react-router-redux';

export default function adminAccess(action$) {
  return action$.ofType(LOCATION_CHANGE)
    .map(action => action.payload.pathname)
    .filter(pathname => pathname === '/admin')
    // If you wanted to do an actual access check you
    // could do so here then filter by failed checks.
    .delay(2000)
    .map(() => push('/'));
}
