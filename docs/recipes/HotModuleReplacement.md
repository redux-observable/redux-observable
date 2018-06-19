# Hot Module Replacement

Replacing Epics that were already running with a new version can potentially create strange bugs because Epics naturally _may_ maintain some internal state or depend on some external transient state or side effect. Think about how debouncing keeps track, or more insidious before you kick off an AJAX request you put the store into a pending state. This is not unique to redux-observable; every alternative middleware we know of has this problem because it's inherent to the nature of handling side effects.

In practice however, you may still want to do it since Hot Module Replacement is only used in local development. Bearing in mind the caveats, we can achieve it by swapping out the currenting running root Epic.

There are a number of ways of doing it, here's one:

```js
import { rootEpic } from './where-ever-they-are';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const epicMiddleware = createEpicMiddleware();
const store = createStore(rootReducer, applyMiddleware(epicMiddleware));

const epic$ = new BehaviorSubject(rootEpic);
// Every time a new epic is given to epic$ it
// will unsubscribe from the previous one then
// call and subscribe to the new one because of
// how switchMap works
const hotReloadingEpic = (...args) =>
  epic$.pipe(
    switchMap(epic => epic(...args))
  );

epicMiddleware.run(hotReloadingEpic);

if (module.hot) {
  module.hot.accept('./where-ever-they-are', () => {
    const nextRootEpic = require('./where-ever-they-are').rootEpic;
    epic$.next(nextRootEpic);
  });
}
```

Another way to handle this would be to have a redux action that signals the end

```js
import { rootEpic } from './where-ever-they-are';
import { ofType } from 'redux-observable';
import { BehaviorSubject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';

const epicMiddleware = createEpicMiddleware();
const store = createStore(rootReducer, applyMiddleware(epicMiddleware));

const epic$ = new BehaviorSubject(rootEpic);
// Since we're using mergeMap, by default any new
// epic that comes in will be merged into the previous
// one, unless an EPIC_END action is dispatched first,
// which would cause the old one(s) to be unsubscribed
const hotReloadingEpic = (action$, ...rest) =>
  epic$.pipe(
    mergeMap(epic =>
      epic(action$, ...rest).pipe(
        takeUntil(action$.pipe(
          ofType('EPIC_END')
        ))
      )
    )
  );

epicMiddleware.run(hotReloadingEpic);

if (module.hot) {
  module.hot.accept('./where-ever-they-are', () => {
    const nextRootEpic = require('./where-ever-they-are').rootEpic;
    // First kill any running epics
    store.dispatch({ type: 'EPIC_END' });
    // Now setup the new one
    epic$.next(nextRootEpic);
  });
}
```
