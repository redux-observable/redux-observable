import testEpic from '../epicTestHelper';
import * as ActionTypes from '../ActionTypes';
import { clearSearchResults } from '../actions';
import clearSearchResultsEpic from './clearSearchResults';

describe('clearSearchResults epic', () => {
  it('creates no action when called with a query', async () => {
    const sourceAction = { type: ActionTypes.SEARCHED_USERS, payload: { query: 'some query' } };
    const expectedActions = [];
    const resultingActions = await testEpic(clearSearchResultsEpic, sourceAction);

    expect(resultingActions).toEqual(expectedActions);
  });

  it('creates cleared action when called without a query', async () => {
    const sourceAction = { type: ActionTypes.SEARCHED_USERS, payload: { query: '' } };
    const expectedActions = [clearSearchResults()];
    const resultingActions = await testEpic(clearSearchResultsEpic, sourceAction);

    expect(resultingActions).toEqual(expectedActions);
  });
});
