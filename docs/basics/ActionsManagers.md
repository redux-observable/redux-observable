# Actions Managers

>##### Not familiar with Observables/RxJS?
> redux-observable requires an understanding of Observables with RxJS. If you're new to Reactive Programming with RxJS, head over to [http://reactivex.io/rxjs/](http://reactivex.io/rxjs/) to familiarize yourself first.

An **Actions Manager** (or Manager for short) is the core primitive of redux-observable.

It is a function which takes a stream of actions and returns a stream of actions. **Actions in, actions out.**

You can think of it of having roughly this type signature:

```js
function (action$: Observable<Action>, store: Store): Observable<Action>;
```

While you'll most commonly produce actions out in response to some action you received in, keep in mind that's not actually a requirement! Once you're inside your Manager, use any Observable patterns you desire as long as anything output from the outermost stream is an action.

The actions you emit will be immediately dispatched through the normal `store.dispatch()`, so under the hood redux-observable effectively does `manager(actions$, store).subscribe(store.dispatch)`

> The pattern of handling side effects this way is similar to the *process manager* pattern, [often](http://kellabyte.com/2012/05/30/clarifying-the-saga-pattern/) [incorrectly](https://msdn.microsoft.com/en-us/library/jj591569.aspx) described as a *saga*. If you're familiar with [redux-saga](http://yelouafi.github.io/redux-saga/), redux-observable is very similar. But because it uses RxJS it is much more declarative and you utilize and expand your existing RxJS abilities.

Keep in mind that letting an incoming action pass through transparently will create an infinite loop:

```js
const actionManager = (action$) => action$;
```


## A Basic Example

Let's start with a simple Actions Manager example:

```js
const pingManager = action$ =>
  action$.filter(action => action.type === 'PING')
    .mapTo({ type: 'PONG' });
    
// later...
dispatch({ type: 'PING' });
```

> Noticed how `action$` has a dollar sign at the end? It's simply a common RxJS convention to identify variables that reference a stream.
 
`pingManager` will listen for actions of type `PING` and map them to a new action, `PONG`. This example is functionally equivalent to doing this:

```js
dispatch({ type: 'PING' });
dispatch({ type: 'PONG' });
```

> Actions Managers run alongside the normal Redux dispatch channel, so you cannot "swallow" an incoming action. When you map one of those actions to another, you're not preventing the original action from reaching the reducers.

The real power starts to reveal itself when you need to do something asynchronous. Let's say you want to dispatch `PONG` 1 second after receiving the `PING`:

```js
const pingManager = action$ =>
  action$.filter(action => action.type === 'PING')
    .delay(1000) // Asynchronously wait 1000ms then continue
    .mapTo({ type: 'PONG' });

// later...
dispatch({ type: 'PING' });
```

Your reducers will receive the original `PING` action, then 1 second later receive the `PONG`.

```js
const pingReducer = (state = { isPinging: false }, action) => {
  switch (action.type) {
    case 'PING':
      return { isPinging: true };

    case 'PONG':
      return { isPinging: false };

    default:
      return state;
  }
};
```

Since filtering by a specific action type is so common, the actions stream redux-observable gives you is a special `ActionsObservable` which has a custom `ofType()` operator to reduce that boilerplate:

```js
const pingManager = action$ =>
  action$.ofType('PING')
    .delay(1000) // Asynchronously wait 1000ms then continue
    .mapTo({ type: 'PONG' });
```

## A Real World Example

Now that we have a general idea of what an Actions Manager looks like, let's continue with a more real-world example:

```js
// action creator
const fetchUser = username => ({ type: FETCH_USER, payload: username });

// process manager
const fetchUserManager = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      ajax.getJSON(`https://api.github.com/users/${action.payload}`)
        .map(response => ({ type: FETCH_USER_FULFILLED, payload: response }))
    );
    
// later...
dispatch(fetchUser('torvalds'));
```

> We're using action creators (aka factories) like `fetchUser` instead of creating the action POJO directly. This is a Redux convention that is totally optional.

We have a standard Redux action creator `fetchUser`, but also a corresponding Manager to orchestrate the actual AJAX call. When that AJAX call comes back, we map the response to a `FETCH_USER_FULFILLED` action.

> Remember, Actions Managers take stream of **actions in** and return a stream of **actions out**. If the RxJS operators and behavior shown so far is unfamiliar to you, you'll definitely want to take some time to [dive deeper into RxJS](http://reactivex.io/rxjs/) before proceeding.

You can then update your Store's state in response to that `FETCH_USER_FULFILLED` action:

```js
const users = (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_USER_FULFILLED':
      return {
        ...state,
        // `login` is the username
        [action.payload.login]: action.payload
      };

    default:
      return state;
  }
};
```

## Accessing the Store's State

Your Actions Managers receive a second argument, the Redux store itself.

```js
function (action$: Observable<Action>, store: Store): Observable<Action>;
```

With this, you can call `store.getState()` to synchronously access the current state:

```js
const INCREMENT = 'INCREMENT';
const INCREMENT_IF_ODD = 'INCREMENT_IF_ODD';

const incrementIfOdd = () => ({ type: INCREMENT_IF_ODD });
const increment = () => ({ type: INCREMENT });

const incrementIfOddManager = (action$, store) => (
  action$.ofType(INCREMENT_IF_ODD)
    .filter(() => store.getState().counter % 2 === 0)
    .map(increment);
);

// later...
dispatch(incrementIfOdd());
```

Remember, `store.getState()` is just an imperative, synchronous API. You cannot treat it as a stream as-is. While it's not a common pattern for Managers to need, the Redux actually supports being converted to a stream of changes:

```js

const offlineStateManager = (_, store) =>
  Observable.of(store)
    .do(state => localStorage.setItem('state', state))
    .ignoreElements(); // we have no actions to emit
```

## Combining Actions Managers

Finally, redux-observable provides a utility called [`combineManagers()`](../api/combineManagers.md) that allows you to easily combine multiple Action Managers into a single one:

```js
import { combineManagers } from 'redux-observable';

const rootManager = combineManagers(
  pingManager,
  fetchUserManager
);
```

Note that this is equivalent to:

```js
import { merge } from 'rxjs/observable/merge';

const rootManager = (action$, store) => merge(
  pingManager(action$, store),
  fetchUserManager(action$, store)
);
```

## Next Steps

Next, we’ll explore how to [activate your Actions Managers](SettingUpTheMiddleware.md) so they can start listening for actions.
