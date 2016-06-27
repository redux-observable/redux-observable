# `combineManagers(...managers)`

`combineManagers()`, as the name suggests, allows you to take multiple Actions Managers an combine them into a single one.

#### Arguments

1. *`...managers: ActionsManager[]`*: The [Actions Managers](../basics/ActionsManagers.md) to combine.

#### Returns

(*`ActionsManager`*): An Actions Manager that merges the output of every Actions Manager provided and passes along the `ActionsObservable` and redux store as arguments.

#### Example

#### `managers/index.js`

```js
import { combineManagers } from 'redux-observable';
import pingManager from './ping';
import fetchUserManager from './fetchUser';

export default combineManagers(
  pingManager,
  fetchUserManager
);
```
