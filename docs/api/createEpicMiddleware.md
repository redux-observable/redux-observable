# `createEpicMiddleware([options])`

`createEpicMiddleware()` is used to create an instance of the actual redux-observable middleware.

#### Arguments

1. *`[options: Object]`*: The optional configuration. Options:
    * *`dependencies`*: If given, it will be injected as the 3rd argument to all epics.

#### Returns

(*`MiddlewareAPI`*): An instance of the redux-observable middleware.

#### Example

### redux/configureStore.js

```js
import { createStore, applyMiddleware, compose } from 'redux';
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
