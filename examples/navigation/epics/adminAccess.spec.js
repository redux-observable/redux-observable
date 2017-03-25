import testEpic from '../epicTestHelper';
import * as ActionTypes from '../ActionTypes';
import adminAccessEpic from './adminAccess';
import { accessDenied } from '../actions';
import { push } from 'react-router-redux';

describe('adminAccess epic', () => {
  it('creates an accessDenied action first, then a route change action', async () => {
    const sourceAction = { type: ActionTypes.CHECKED_ADMIN_ACCESS };
    const expectedActions = [accessDenied(), push('/')];
    const resultingActions = await testEpic(adminAccessEpic, sourceAction);

    expect(resultingActions).toEqual(expectedActions);
  });
});
