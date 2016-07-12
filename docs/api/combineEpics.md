# `combineEpics(...epics)`

`combineEpics()`, as the name suggests, allows you to take multiple epics and combine them into a single one.

#### Arguments

1. *`...epics: Epic[]`*: The [epics](../basics/Epics.md) to combine.

#### Returns

(*`Epic`*): An Epic that merges the output of every Epic provided and passes along the `ActionsObservable` and redux store as arguments.

#### Example

#### `epics/index.js`

```js
import { combineEpics } from 'redux-observable';
import pingEpic from './ping';
import fetchUserEpic from './fetchUser';

export default combineEpics(
  pingEpic,
  fetchUserEpic
);
```
