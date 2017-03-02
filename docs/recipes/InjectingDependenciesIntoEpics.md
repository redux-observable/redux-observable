# Injecting Dependencies Into Epics

Sometimes you might want to have some dependencies injected into your epics. Things that you might want to mock in tests fall into this category.

Let's say you want to interact with the network. You could use the `ajax` method directly from `rxjs`:

```js
import { ajax } from 'rxjs/observable/dom/ajax'

export const fetchUsersEpic = action$ => action$.ofType('FETCH_USERS_REQUESTED')
  .flatMap(() => ajax.getJSON('https://my.api.com/users'))
  .map(response => ({ type: 'FETCH_USERS_COMPLETED', payload: response }))
```

But there is a problem with this approach: how interacting with the network happens is now hardcoded into your epic. There is no way of mocking the `ajax.getJSON` method, and test if the _epic_ is actually doing what it should (without involving direct interaction with the API)!

### injecting dependencies

To inject dependencies you can use `createEpicMiddleware`'s `dependencies` configuration option:

```js
import { createEpicMiddleware, combineEpics } from 'redux-observable'
import { ajax } from 'rxjs/observable/dom/ajax'
import { fetchUsersEpic } from './fetchUsers'

export const epicMiddleware = createEpicMiddleware(
  combineEpics(
    fetchUsersEpic,
    // other epics ...
  ),
  { dependencies: { ajax } }
)
```

With this in mind you can rewrite your epic without importing and using `ajax` directly, and just rely on the given `dependencies` object:

```js
export const fetchUsersEpic = (action$, _ /* store */, { ajax }) => action$.ofType('FETCH_USERS_REQUESTED')
  .flatMap(() => ajax.getJSON('https://my.api.com'))
  .map(response => ({ type: 'FETCH_USERS_COMPLETED', payload: response }))
```

And in your test you can easily mock `ajax`:

```js
import { fetchUsersEpic } from './fetchUsers'

const store = ...
const mockAjax = ...
const action = { type: 'FETCH_USERS_REQUESTED' }

const resultObservable = fetchUsersEpic(Observable.of(action), store, { ajax: mockAjax })

// assertions
```