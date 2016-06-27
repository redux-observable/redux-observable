# Setting Up The Middleware

Now that we know what [Actions Managers](ActionsManagers.md) are, we need to provide them to the redux-observable middleware so they can start listening for actions.

## Root Action Manager

Just like redux requiring a single root Reducer, redux-observable also requires you to have a single root Action Manager. As we [learned previously](ActionsManagers.md), we can use `combineManagers()` accomplish this.

One common pattern is to import all your Managers into a single file, which then combined root Manager along with your root Reducer.

### redux/modules/root.js

```js
import { combineManagers } from 'redux-observable';
import ping, { pingManager } from './ping';
import users, { fetchUserManager } from './users';

export const rootManager = combineManagers(
  pingManager,
  fetchUserManager
);

export const rootReducer = combineReducers({
  ping,
  users
});
```

> This pattern is an extension of the [Ducks Modular Redux pattern](https://github.com/erikras/ducks-modular-redux).

## Configuring The Store

Now you'll want to create an instance of the redux-observable middleware, passing along our newly created root Manager. 

```js
import { createManagerMiddleware } from 'redux-observable';
import { rootManager } from './modules/root';

const managerMiddleware = createManagerMiddleware(rootManager);
```

When you put that together with your existing Store configuration, it will look something like this:

### redux/configureStore.js

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { createManagerMiddleware } from 'redux-observable';
import { rootManager, rootReducer } from './modules/root';

export default function configureStore() {
  const store = createStore(
    rootReducer,
	applyMiddleware(createManagerMiddleware(rootManager))
  );

  return store;
}
```
