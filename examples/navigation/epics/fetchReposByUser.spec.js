import { Observable } from 'rxjs/Rx';
import testEpic from '../epicTestHelper';
import * as ActionTypes from '../ActionTypes';
import { receiveUserRepos } from '../actions';
import fetchReposByUserEpic from './fetchReposByUser';

describe('clearSearchResults epic', () => {
  let getJSON;
  let resultingActions;

  beforeAll( async() => {
    // replacing the side-effect with a fake for DI
    getJSON = jest.fn().mockReturnValue(Observable.of(['repo1']));

    const sourceAction = { type: ActionTypes.REQUESTED_USER_REPOS, payload: { user: 'johnDoe' } };
    const dependencies = { ajax: { getJSON } };
    resultingActions = await testEpic(fetchReposByUserEpic, sourceAction, undefined, dependencies);
  });

  it('calls the github api with the correct user name', async () => {
    expect(getJSON).toHaveBeenCalledWith('https://api.github.com/users/johnDoe/repos');
  });

  it('creates a receiveUserRepos action with the user and the result', async () => {
    const expectedActions = [receiveUserRepos('johnDoe', ['repo1'])];
    expect(resultingActions).toEqual(expectedActions);
  });
});
