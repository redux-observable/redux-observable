# Hot Module Replacement

Replacing Epics that were already running with a new version can potentially create strange bugs because Epics naturally _may_ maintain some internal state or depend on some external transient state or side effect. Think about how debouncing keeps track, or more insidious before you kick off an AJAX request you put the store into a pending state. This is not unique to redux-observable; every alternative middleware we know of has this problem because it's inherent to the nature of handling side effects.

In practice however, we're unsure if this will notably impact the typical developer and since Hot Module Replacement is only used in local development, we do provide a `replaceEpic(nextEpic)` method that can be used for this purpose.

```js
import rootEpic from './where-ever-they-are';
const epicMiddleware = createEpicMiddleware(rootEpic);

if (module.hot) {
  module.hot.accept('./where-ever-they-are', () => {
    const rootEpic = require('./where-ever-the-are').default;
    epicMiddleware.replaceEpic(rootEpic);
  });
}
```

To mitigate the aforementioned issues, when you call `replaceEpic` an `@@redux-observable/EPIC_END` action is dispatched before the replacement actually happens. This gives you a **synchronous** opportunity to do any cleanup you need. You choose to listen for this action in your Epic itself or in you reducer, where ever it makes the most sense.

#### Inside your Reducer

```js
import { EPIC_END } from 'redux-observable';

const userIsPending = (state = false, action) => {
  switch (action.type) {
	case EPIC_END:
	case FETCH_USER_FULFILLED:
	case FETCH_USER_CANCELLED:
	  return false;
	  
	case FETCH_USER:
      return true;

    default:
      return state;
  }
};
```

#### Inside your Epic

```js
import { EPIC_END } from 'redux-observable';

// Race between the AJAX call and an EPIC_END.
// If the EPIC_END, emit a cancel action to
// put the store in the correct state
const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      race(
        ajax(`/api/users/${action.payload}`),
        action$.ofType(EPIC_END)
          .take(1)
          .mapTo({ type: FETCH_USER_CANCELLED })
      )
    );
```

If you use `replaceEpic` and have noticed bugs of any kind (or even if it works wonderfully for you!), [please do report them](https://github.com/redux-observable/redux-observable/issues/new) so we can evaluate the future of this feature!
