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
import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './modules/rootEpic';

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    // ...reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

  epicMiddleware.run(rootEpic);
}
```
