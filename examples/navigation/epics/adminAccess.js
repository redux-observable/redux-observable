import { push, LOCATION_CHANGE } from 'react-router-redux';

function hasAccess() {
  return false;
}

export default function adminAccess(action$) {
  return action$.ofType(LOCATION_CHANGE)
    .map(action => action.payload.pathname)
    .filter(pathname => pathname === '/admin')
    .map(hasAccess)
    .filter(access => !access)
    .delay(2000)
    .mapTo(push('/'));
}
