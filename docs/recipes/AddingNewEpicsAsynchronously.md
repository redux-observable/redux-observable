# Adding New Epics Asynchronously/Lazily

If you are doing code splitting or otherwise want to add an Epic to the middleware after the app is already running, you can do this fairly trivially with composition and standard RxJS.

```js
import { BehaviorSubject } from 'rxjs';
import { combineEpics } from 'redux-observable';

const epic$ = new BehaviorSubject(combineEpics(epic1, epic2));
const rootEpic = (action$, state$) => epic$.pipe(
  mergeMap(epic => epic(action$, state$))
);

// sometime later...add another Epic, keeping the state of the old ones...
epic$.next(asyncEpic1);
// and again later add another...
epic$.next(asyncEpic2);
```

Keep in mind that any existing Epics will be left running as-is. This is not for actual replacement of Epics, like hot reloading.

Adding new Epics to your root Epic is very safe, but replacing Epics that were already running with a new version can potentially create strange bugs because Epics naturally _may_ maintain state or depend on some external transient state or side effect. To learn more about that, check out the [`replaceEpic(nextEpic)`](HotModuleReplacement.md) method.
