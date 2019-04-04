# `createEpicMiddleware([options])`

`createEpicMiddleware()` is used to create an instance of the actual redux-observable middleware.

#### Arguments

1. *`[options: Object]`*: The optional configuration. Options:
    * *`createDependencies`*: A functions that takes the state observable as the only parameter, and returns any object that will be injected as the 3rd argument to all epics. May not be used in conjunction with `dependencies`.
    * *`dependencies`*: If given, it will be injected as the 3rd argument to all epics. May not be used in conjunction with `createDependencies`.

#### Returns

(*`MiddlewareAPI`*): An instance of the redux-observable middleware.

#### Example without dependencies

### redux/configureStore.js

```js
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './modules/root';

const epicMiddleware = createEpicMiddleware();

export default function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(epicMiddleware)
  );

  epicMiddleware.run(rootEpic);

  return store;
}
```

#### Example with dependencies

### redux/configureStore.js

```js
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './modules/root';

const epicMiddleware = createEpicMiddleware({
  dependencies: {
    ping: () => "PING",
    pong: () => "PONG"
  }
});

export default function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(epicMiddleware)
  );

  epicMiddleware.run(rootEpic);

  return store;
}
```

### redux/modules/root.js

```js
export const rootEpic = (action$, state$, { ping, pong }) => 
  action$.pipe(
    filter(action => action.type === ping()),
    mapTo({ type: pong() })
  )
```

#### Example with createDependencies

### redux/configureStore.js

```js
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { ajax } from 'rxjs/ajax';
import { rootEpic, rootReducer } from './modules/root';

const epicMiddleware = createEpicMiddleware({
  createDependencies: state$ => ({
    request: (path) => ajax({
      url: `http://example.com/${path}`,
      headers: {
        Authorization: `Bearer ${state$.value.auth.token}`
      }
    })
  })
});

export default function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(epicMiddleware)
  );

  epicMiddleware.run(rootEpic);

  return store;
}
```

### redux/modules/root.js

```js
export const rootEpic = (action$, state$, { request }) => 
  action$.pipe(
    filter(action => action.type === 'PING'),
    mergeMap(() =>
      request('pong').pipe(
        map(({ response }) => ({
          type: 'PONG',
          payload: response
        })),
        catchError(error => {
          /* handle error */
        })
      ) 
    ),
  )
```

