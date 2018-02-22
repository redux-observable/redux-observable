# `createEpicMiddleware(rootEpic, [options])`

`createEpicMiddleware()` is used to create an instance of the actual redux-observable middleware. You provide a single, root Epic.

#### Arguments

1. _`rootEpic: Epic`_: The root [Epic](../basics/Epics.md)
2. _`[options: Object]`_: The optional configuration. Options:
   * _`dependencies`_: If given, it will be injected as the 3rd argument to all epics.
   * _`adapter`_: An adapter object which can transform the input / output streams provided to your epics. Usually used to adapt a stream library other than RxJS v5, like [adapter-rxjs-v4](https://github.com/redux-observable/redux-observable-adapter-rxjs-v4) or [adapter-most](https://github.com/redux-observable/redux-observable-adapter-most) Options:
     * _`input: ActionsObservable => any`_: Transforms the input stream of actions, `ActionsObservable` that is passed to your root Epic (transformation takes place _before_ it is passed to the root epic).
     * _`output: any => Observable`_: Transforms the return value of root Epic (transformation takes place _after_ the root epic returned it).

#### Returns

(_`MiddlewareAPI`_): An instance of the redux-observable middleware.

#### Example

### redux/configureStore.js

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './modules/root';

const epicMiddleware = createEpicMiddleware(rootEpic);

export default function configureStore() {
  const store = createStore(rootReducer, applyMiddleware(epicMiddleware));

  return store;
}
```
