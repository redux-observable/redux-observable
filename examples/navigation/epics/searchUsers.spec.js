import { Observable } from 'rxjs/Observable';
import { replace } from 'react-router-redux';

import testEpic from '../epicTestHelper';
import * as ActionTypes from '../ActionTypes';
import { receiveUsers } from '../actions';
import searchUsersEpic from './searchUsers';

describe('clearSearchResults epic', () => {
  it('does not create an action when the query is falsy', async () => {
    const sourceAction = { type: ActionTypes.SEARCHED_USERS, payload: { query: '' } };
    const expectedActions = [];
    const resultingActions = await testEpic(searchUsersEpic, sourceAction);

    expect(resultingActions).toEqual(expectedActions);
  });

  describe('querying with a user name', () => {
    let getJSON;
    let resultingActions;

    beforeEach( async () => {
      getJSON = jest.fn().mockReturnValue(Observable.of({ items: ['johnDoe', 'johnDoeTwo'] }));
      const dependencies = { ajax: { getJSON } };
      const sourceAction = { type: ActionTypes.SEARCHED_USERS, payload: { query: 'johnDoe' } };
      resultingActions = await testEpic(searchUsersEpic, sourceAction, undefined, dependencies);
    });

    it('replaces the browser history with the search query first', async () => {
      expect(resultingActions[0]).toEqual(replace('?q=johnDoe'));
    });

    it('creates a received Users next', async () => {
      expect(resultingActions[1]).toEqual(receiveUsers(['johnDoe', 'johnDoeTwo']));
    });

    it('calls the github api to search the user', async () => {
      expect(getJSON).toHaveBeenCalledWith('https://api.github.com/search/users?q=johnDoe');
    });
  });

  describe('debounced output', () => {
    it('calls the API only once with the final query', async() => {
      const getJSON = jest.fn().mockReturnValue(Observable.of({ items: ['johnDoe', 'johnDoeTwo'] }));
      const dependencies = { ajax: { getJSON } };
      const sourceAction = [
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'j' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'jo' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'joh' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'john' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'johnD' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'johnDo' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'johnDoe' } },
      ];
      const resultingActions = await testEpic(searchUsersEpic, sourceAction, undefined, dependencies);

      expect(resultingActions).toHaveLength(2); // route change (1) + received values (2)
      expect(getJSON).toHaveBeenCalledTimes(1);
      expect(getJSON).toHaveBeenCalledWith('https://api.github.com/search/users?q=johnDoe');
    });
  });

  describe('clearing the output before the debounce period is over', () => {
    it('does not dispatch actions or make api calls', async () => {
      const getJSON = jest.fn().mockReturnValue(Observable.of({ items: ['johnDoe', 'johnDoeTwo'] }));
      const dependencies = { ajax: { getJSON } };
      const sourceAction = [
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'j' } },
        { type: ActionTypes.SEARCHED_USERS, payload: { query: 'jo' } },
        { type: ActionTypes.CLEARED_SEARCH_RESULTS }
      ];
      const expectedActions = [];
      const resultingActions = await testEpic(searchUsersEpic, sourceAction, undefined, dependencies);

      expect(resultingActions).toEqual(expectedActions);
      expect(getJSON).not.toHaveBeenCalled();
    });
  });
});
