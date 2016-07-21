# Writing Tests

> Testing async code that creates side effects isn't easy. We're still learning the best way to test Epics. If you have found the perfect way, [do share](https://github.com/redux-observable/redux-observable/issues/new)!

If you haven't already set up testing for regular Redux, you'll want to head over to [their documentation](http://redux.js.org/docs/recipes/WritingTests.html) first to familiarize yourself since nearly all of it is applicable.

One approach is to mock the entire Redux store and replace the root Epic between each test.

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

***

If you're particularly adventurous, we've been experimenting with using [RxJS's `TestScheduler`](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md) along with the [marble diagram helpers](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md). [Check out a JSBin example](http://jsbin.com/pufima/edit?js,output). We're not quite ready to "suggest" this approach per say, but we'd love feedback or someone interested in helping pave the way!