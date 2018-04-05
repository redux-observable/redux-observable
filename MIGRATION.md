# Migration to 1.0.0 of redux-observable

This document is a WIP, but will contain a list of things that are different from the pre-1.0.0 version of redux-observable.

# Upgrading

[![Latest pre-release version](https://img.shields.io/npm/v/redux-observable/next.svg?label=%22latest%20pre-release%22)](/CHANGELOG.md)

The final version of 1.0.0 is not yet released, but to install the latest pre-release (alpha/beta/rc) you can use:

```
npm install --save-exact redux-observable@next
# or
yarn add redux-observable@next --exact
```

Please keep in mind that as a pre-release, it's possible breaking changes will be introduced between versions. Feedback is definitely appreciated!

> The npm `next` version tag will immediately resolve to what ever the latest pre-release version is, e.g. 1.0.0-alpha.0 (or what ever it currently is). Using the above commands, that exact version will get saved in your package.json so that you don't accidentally pick up any _future_ pre-release that may or may not have unexpected breaking changes.

## Dispatching an action

The ability to call `store.dispatch()` inside your Epics was originally provided as an escape hatch, to be used rarely, if ever. Unfortunately in practice we've seen a large number of people using it extensively. Instead, Epics should emit actions through the Observable the Epic returns, using idiomatic RxJS. If you're looking for the ability to directly call dispatch yourself (rather than emit through streams) you may be interested in using an alternative middleware that is less opinionated around RxJS.

> **This is unrelated to usage of store.dispatch inside your UI components or anywhere outside of redux-observable--you will continue to use it there**

[Learn More](https://github.com/redux-observable/redux-observable/pull/346)

#### Before

```js
const somethingEpic = (action$, store) =>
  action$.ofType(SOMETHING)
    .switchMap(() =>
      ajax('/something')
        .do(() => store.dispatch({ type: SOMETHING_ELSE }))
        .map(response => ({ type: SUCCESS, response }))
    );
```

#### After

```js
const somethingEpic = action$ =>
  action$.ofType(SOMETHING)
    .switchMap(() =>
      ajax('/something')
        .mergeMap(response => Observable.of(
          { type: SOMETHING_ELSE },
          { type: SUCCESS, response }
        ))
    );
```

In v1.0.0 `store.dispatch()` is strongly deprecated and will be completely removed in v2.0.0 which will come fairly quickly (if it is not already out by now).

## Accessing state

As `store.dispatch` is being removed, and since redux-observable has had several years to be used and mature in the wild, it became clear that calling `store.getState()` is useful but there are also usecases to having an Observable of state$ too.

In v1.0.0 of redux-observable, the second argument to your Epics is now a custom StateObservable, referred to from now on as `state$`. It has a `value` property that always contains the latest value of your redux state. This can be used in the same imperative way you used to use `store.getState()`.

Since `state$` is also an Observable you can now compose it into other streams as you might expect and react to state changes--you can also call `state$.subscribe()` directlly, but it's usually more idiomatic to compose it with other operators rather than explicitly calling `subscribe` yourself.

I expect a majority of people to use the imperative `state$.value` form most of the time simply because it's more terse and a majority of the time you don't actually want to react to changes in the state.

#### Before

```js
const fetchUserEpic = (action$, store) =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      getJson(`/users/${action.id}`, { 'Authorization': `Bearer ${store.getState().authToken}` }) // <----- here
        .map(respose => fetchUserFulfilled(response))
    );
```

#### After

```js
// Also now using v6 pipe operators
const fetchUserEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_USER),
    mergeMap(action =>
      getJson(`/users/${action.id}`, { 'Authorization': `Bearer ${state$.value.authToken}` })).pipe( // <----- here
        map(respose => fetchUserFulfilled(response))
      )
    )
  );

// or the "reactive" way, but more verbose

const fetchUserEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_USER),
    withLatestFrom(
      state$.pipe(
        take(1), // We don't want to react to changes in this example
      )
    ),
    mergeMap(([action, state]) =>
      getJson(`/users/${action.id}`, { 'Authorization': `Bearer ${state.authToken}` }).pipe(
        map(respose => fetchUserFulfilled(response))
      )
    )
  );
```

Since it's a stream, you can do all sorts of cool things:

```js
// This code is UNTESTED and likely has bugs, just here to give you the gist.
// It shows one possible way of having an auto-save feature based on the state
// changing instead of needing to know all the possible actions that could change
// that state.
const fetchUserEpic = (action$, state$) =>
  action$.pipe(
    ofType(AUTO_SAVE_ENABLE),
    exhaustMap(() =>
      state$.pipe(
        pluck('googleDocument'),
        distinctUntilChanged(),
        throttleTime(500, { leading: false, trailing: true }),
        concatMap(googleDocument =>
          saveGoogleDoc(googleDocument).pipe(
            map(() => saveGoogleDocFulfilled()),
            catchError(e => of(saveGoogleDocRejected(e)))
          )
        ),
        takeUntil(action$.pipe(
          ofType(AUTO_SAVE_DISABLE)
        ))
      )
    )
  );
```

> Have a cool usecase for state$? Please let us know by opening an issue ticket so we can feature it!

[Learn More](https://github.com/redux-observable/redux-observable/pull/410)

***

Are we missing something about the migration? Open an issue or open a PR if possible!
