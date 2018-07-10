# `combineEpics(...epics)`

`combineEpics()`, as the name suggests, allows you to take multiple epics and combine them into a single one.
Please keep in mind that the order in which epics are combined affect the order in which they are executed and receive actions.

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
