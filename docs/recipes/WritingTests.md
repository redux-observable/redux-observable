# Writing Tests

## Using the RxJS TestScheduler

RxJS comes with a TestScheduler that is used to virtualize time, making writing deterministic tests easier and much faster since time is virtual--you don't have to wait for _real_ time to pass.

In RxJS v6 there is a new `testScheduler.run(callback)` helper that provides several new conveniences on top of the previous TestScheduler behavior.

Before continuing, you'll want to become familiar with [how to use the `testScheduler.run(callback)`](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/testing/marble-testing.md).

> Learning to use and write marble tests can be tough. While learning, keep in mind that these are RxJS concepts, not redux-observable, so you may find other articles on the web helpful for testing your RxJS code.

While there are several ways to test Epics, it's helpful to fully appreciate that they're just functions that utilize RxJS--aside from the convention of expecting `{ type: string }` objects, they have no direct coupling to Redux itself.

That means we can just call an Epic like any other function, passing in our own mock for `action$`, `state$`, and any dependencies.

Here's a very simple Epic we'll write a test for:

```js
const fetchUserEpic = (action$, state$, { getJSON }) => action$.pipe(
  ofType('FETCH_USER'),
  mergeMap(action =>
    getJSON(`https://api.github.com/users/${action.id}`).pipe(
      map(response => ({ type: 'FETCH_USER_FULFILLED', response }))
    )
  )
);
```

> Notice how we utilize the [built-in support for a very simple dependency injection](https://redux-observable.js.org/docs/recipes/InjectingDependenciesIntoEpics.html) as our third argument? Many testing frameworks provide **better** mocking facilities for testing. For example, [Jest provides really great mocking functionality](http://jestjs.io/docs/en/manual-mocks.html). Use what works best for you!

Now we can test it using [`testScheduler.run(callback)` with marble diagrams](https://github.com/ReactiveX/rxjs/blob/master/doc/marble-testing.md):

```js
import { TestScheduler } from 'rxjs/testing';

const testScheduler = new TestScheduler((actual, expected) => {
  // somehow assert the two objects are equal
  // e.g. with chai `expect(actual).deep.equal(expected)`
});

testScheduler.run(({ hot, cold, expectObservable }) => {
  const action$ = hot('-a', {
    a: { type: 'FETCH_USER', id: '123' }
  });
  const state$ = null;
  const dependencies = {
    getJSON: url => cold('--a', {
      a: { url }
    })
  };

  const output$ = fetchUserEpic(action$, state$, dependencies);

  expectObservable(output$).toBe('---a', {
    a: {
      type: 'FETCH_USER_FULFILLED',
      response: {
        url: 'https://api.github.com/users/123'
      }
    }
  });
});
```

> You may find you commonly have nearly identical tests (and Epics too!). Consider reducing boilerplate by creating your own abstractions around the most common patterns.
