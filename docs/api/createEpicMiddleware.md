# `createEpicMiddleware(rootEpic)`

`createEpicMiddleware()` is used to create an instance of the actual redux-observable middleware. You provide a single, root Epic.

#### Arguments

1. *`rootEpic: Epic`*: The root [Epic](../basics/Epics.md)
2. *`[options: Object]`*: The optional configuration. Options:
    * *`dependencies`*: If given, it will be injected as the 3rd argument to all epics.
    * *`adapter`*: An adapter object which can transform the input / output `Observable`s. Options:
       * *`input: ActionsObservable => Observable`*: Transforms the input `Observable` (transformation takes place *before* it is passed to the root epic).
       * *`output: Observable => Observable`*: Transforms the output `Observable` (transformation takes place *after* the root epic returned it).

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
