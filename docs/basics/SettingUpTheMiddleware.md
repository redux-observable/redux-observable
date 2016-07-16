# Setting Up The Middleware

Now that we know what [Epics](Epics.md) are, we need to provide them to the redux-observable middleware so they can start listening for actions.

## Root Epic

Just like redux requiring a single root Reducer, redux-observable also requires you to have a single root Epic. As we [learned previously](Epics.md), we can use `combineEpics()` to accomplish this.

One common pattern is to import all your Epics into a single file, which then exports the root Epic, along with your root Reducer.

### redux/modules/root.js

```js
import { combineEpics } from 'redux-observable';
import ping, { pingEpic } from './ping';
import users, { fetchUserEpic } from './users';

export const rootEpic = combineEpics(
  pingEpic,
  fetchUserEpic
);

export const rootReducer = combineReducers({
  ping,
  users
});
```

> This pattern is an extension of the [Ducks Modular Redux pattern](https://github.com/erikras/ducks-modular-redux).

## Configuring The Store

Now you'll want to create an instance of the redux-observable middleware, passing along our newly created root Epic. 

```js
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './modules/root';

const epicMiddleware = createEpicMiddleware(rootEpic);
```

When you put that together with your existing Store configuration, it will look something like this:

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
