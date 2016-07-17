# Writing Tests

If you haven't already set up testing for regular Redux, you'll want to head over to [their documentation](http://redux.js.org/docs/recipes/WritingTests.html) first to familiarize yourself since nearly all of it is applicable.

The most flexible approach is to mock the entire Redux store and replace the root Epic between each test.

```js
import nock from 'nock';
import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';
import { fetchUserEpic, fetchUser, FETCH_USER } from '../../redux/modules/user';

const epicMiddleware = createEpicMiddleware(fetchUserEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('fetchUserEpic', () => {
  let store;

  afterEach(() => {
    nock.cleanAll();
    store = mockStore();
    epicMiddleware.replaceEpic(fetchUserEpic);
  });

  it('produces the user model', () => {
    const payload = { id: 123 };
    nock('http://example.com/')
      .get('/api/users/123')
      .reply(200, payload);

    store.dispatch({ type: FETCH_USER });

    expect(store.getActions()).toEqual([
      { type: FETCH_USER },
      { type: FETCH_USER_FULFILLED, payload }
    ]);
  });
});
```
