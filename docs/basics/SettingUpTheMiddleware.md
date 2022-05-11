# Setting Up The Middleware

Now that we know what [Epics](Epics.md) are, we need to provide them to the redux-observable middleware so they can start listening for actions.

## Root Epic

redux-observable requires a single root Epic. As we [learned previously](Epics.md), we can use `combineEpics()` to accomplish this.

We recommend importing all of your Epics into a single file, which then exports the root Epic and the root Reducer.

### app/rootEpic.js

```js
import { combineEpics } from "redux-observable";
import { pingEpic } from "features/ping/pingEpic";
import { fetchUserEpic } from "features/users/usersEpic";

export const rootEpic = combineEpics(pingEpic, fetchUserEpic);
```

> This pattern is an extension of the [Ducks Modular Redux pattern](https://github.com/erikras/ducks-modular-redux).

## Configuring The Store

Now create an instance of the redux-observable middleware.

```js
import { createEpicMiddleware } from "redux-observable";

const epicMiddleware = createEpicMiddleware();
```

Then you pass this to the configureStore function from Redux.

```js
import { configureStore } from "@reduxjs/toolkit";
import ping from "features/ping/pingSlice";
import users from "features/users/usersSlice";

const store = configureStore({
  reducer: {
    ping,
    users,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});
```

And after that you call `epicMiddleware.run()` with the rootEpic you created earlier.

```js
import { rootEpic } from "./rootEpic";

epicMiddleware.run(rootEpic);
```

Integrate the code above with your existing Store configuration so that it looks like this:

### app/store.js

```js
import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import { rootEpic } from "./rootEpic";
import ping from "features/ping/pingSlice";
import users from "features/users/usersSlice";

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    ping,
    users,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);
```

## Adding global error handler

Uncaught errors can bubble up to the root epic and cause the entire stream to terminate. As a consequence, epics registered in the middleware will no longer run in your application. To alleviate this issue, you can add a global error handler to the root epic that catches uncaught errors and resubscribes to the source stream.

```js
const rootEpic = (action$, store$, dependencies) =>
  combineEpics(...epics)(action$, store$, dependencies).pipe(
    catchError((error, source) => {
      console.error(error);
      return source;
    })
  );
```

Within the body of the function based to the `catchError` operator, you can log the uncaught error to standard error or any other exception logging tool.

Note that in the example above, the `console.error` function is not supported in IE 8/9.

Also note that restarting the root epic can have some unintended consequences, especially if your application uses stateful epics, as they may lose state in the restart.
