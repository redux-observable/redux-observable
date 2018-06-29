# Injecting Dependencies Into Epics

> Many testing frameworks provide **better** mocking facilities for testing than what is described here. For example, [Jest provides really great mocking functionality](http://jestjs.io/docs/en/manual-mocks.html). Use what works best for you!

Injecting your dependencies into your Epics can help with testing.

Let's say you want to interact with the network. You could use the `ajax` helpers directly from `rxjs`:

```js
import { ajax } from 'rxjs/ajax';

const fetchUserEpic = (action$, state$) => action$.pipe(
  ofType('FETCH_USER'),
  mergeMap(({ payload }) => ajax.getJSON(`/api/users/${payload}`).pipe(
    map(response => ({
      type: 'FETCH_USER_FULFILLED',
      payload: response
    }))
  )
);
```

But there is a problem with this approach: Your file containing the epic imports its dependency directly, so mocking it is much more difficult.

One approach might be to mock `window.XMLHttpRequest`, but this is a lot more work and now you're not just testing your Epic, you're testing that RxJS correctly uses XMLHttpRequest a certain way when in fact that shouldn't be the goal of your test.

### Injecting dependencies

To inject dependencies you can use `createEpicMiddleware`'s `dependencies` configuration option:

```js
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { ajax } from 'rxjs/ajax';
import rootEpic from './somewhere';

const epicMiddleware = createEpicMiddleware({
  dependencies: { getJSON: ajax.getJSON }
});

epicMiddleware.run(rootEpic);
```

Anything you provide will then be passed as the third argument to all your Epics, after the store.

Now your Epic can use the injected `getJSON`, instead of importing it itself:

```js
// Notice the third argument is our injected dependencies!
const fetchUserEpic = (action$, state$, { getJSON }) => action$.pipe(
  ofType('FETCH_USER'),
  mergeMap(({ payload }) => getJSON(`/api/users/${payload}`).pipe(
    map(response => ({
      type: 'FETCH_USER_FULFILLED',
      payload: response
    }))
  )
);

```

To test, you can just call your Epic directly, passing in a mock for `getJSON`:

```js
import { of } from 'rxjs';
import { fetchUserEpic } from './somewhere/fetchUserEpic';

const mockResponse = { name: 'Bilbo Baggins' };
const action$ = of({ type: 'FETCH_USERS_REQUESTED' });
const state$ = null; // not needed for this epic
const dependencies = {
  getJSON: url => of(mockResponse)
};

// Adapt this example to your test framework and specific use cases
const result$ = fetchUserEpic(action$, state$, dependencies).pipe(
  toArray() // buffers output until your Epic naturally completes()
);

result$.subscribe(actions => {
  assertDeepEqual(actions, [{
    type: 'FETCH_USER_FULFILLED',
    payload: mockResponse
  }]);
});
```
