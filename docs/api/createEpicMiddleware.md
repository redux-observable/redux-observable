# `createEpicMiddleware(rootEpic)`

`createEpicMiddleware()` is used to create an instance of the actual redux-observable middleware. You provide a single, root Epic.

#### Arguments

1. *`rootEpic: Epic`*: The root [Epic](../basics/Epics.md)

#### Returns

(*`MiddlewareAPI`*): An instance of the redux-observable middleware.

#### Example

### redux/configureStore.js

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './modules/root';

const epicMiddleware = createEpicMiddleware(rootEpic);

export default function configureStore() {
  const store = createStore(
    rootReducer,
	applyMiddleware(epicMiddleware)
  );

  return store;
}
```
