# Epics

>##### Not familiar with Observables/RxJS v6?
> redux-observable requires an understanding of Observables with RxJS v6. If you're new to Reactive Programming with RxJS v6, head over to [http://reactivex.io/rxjs/](http://reactivex.io/rxjs/) to familiarize yourself first.
>
> redux-observable (because of RxJS) truly shines the most for complex async/side effects. If you're not already comfortable with RxJS you might consider using [redux-thunk](https://github.com/gaearon/redux-thunk) for simple side effects and then use redux-observable for the complex stuff. That way you can remain productive and learn RxJS as you go. redux-thunk is much simpler to learn and use, but that also means it's far less powerful. Of course, if you already love Rx like we do, you will probably use it for everything!

An **Epic** is the core primitive of redux-observable.

It is a function which takes a stream of actions and returns a stream of actions. **Actions in, actions out.**

It has roughly this type signature:

```js
function (action$: Observable<Action>, state$: StateObservable<State>): Observable<Action>;
```

While you'll most commonly produce actions out in response to some action you received in, that's not actually a requirement! Once you're inside your Epic, use any Observable patterns you desire as long as anything output from the final, returned stream, is an action.

The actions you emit will be immediately dispatched through the normal `store.dispatch()`, so under the hood redux-observable effectively does `epic(action$, state$).subscribe(store.dispatch)`

Epics run alongside the normal Redux dispatch channel, **after** the reducers have already received them--so you cannot "swallow" an incoming action. Actions always run through your reducers _before_ your Epics even receive them.

If you let an incoming action pass through, it will create an infinite loop:

```js
// DO NOT DO THIS
const actionEpic = action$ => action$; // creates infinite loop
```

> The pattern of handling side effects this way is similar to the "*process manager*" pattern, sometimes called a ["*saga*"](https://msdn.microsoft.com/en-us/library/jj591569.aspx), but the original definition of [saga is not truly applicable](http://kellabyte.com/2012/05/30/clarifying-the-saga-pattern/). If you're familiar with [redux-saga](https://redux-saga.github.io/redux-saga/), redux-observable is very similar. But because it uses RxJS it is much more declarative and you utilize and expand your existing RxJS abilities.


## A Basic Example

> **IMPORTANT:** Our examples will not include any imports. Under normal circumstances, all operators (the funtions used within the `pipe()` method) must be imported like `import { filter, mapTo } from 'rxjs/operators';`

Let's start with a simple Epic example:

```js
const pingEpic = action$ => action$.pipe(
  filter(action => action.type === 'PING'),
  mapTo({ type: 'PONG' })
);

// later...
dispatch({ type: 'PING' });
```

> Noticed how `action$` has a dollar sign at the end? It's simply a common RxJS convention to identify variables that reference a stream.

`pingEpic` will listen for actions of type `PING` and map them to a new action, `PONG`. This example is functionally equivalent to doing this:

```js
dispatch({ type: 'PING' });
dispatch({ type: 'PONG' });
```

> REMEMBER: Epics run alongside the normal Redux dispatch channel, **after** the reducers have already received them. When you map an action to another one, **you are not** preventing the original action from reaching the reducers; that action has already been through them!

The real power comes when you need to do something asynchronous. Let's say you want to dispatch `PONG` 1 second after receiving the `PING`:

```js
const pingEpic = action$ => action$.pipe(
  filter(action => action.type === 'PING'),
  delay(1000), // Asynchronously wait 1000ms then continue
  mapTo({ type: 'PONG' })
);

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

Since filtering by a specific action type is so common, redux-observable includes an `ofType` operator to reduce that boilerplate:

```js
import { ofType } from 'redux-observable';

const pingEpic = action$ => action$.pipe(
  ofType('PING'),
  delay(1000), // Asynchronously wait 1000ms then continue
  mapTo({ type: 'PONG' })
);
```

> Need to match against multiple action types? No problem! `ofType` accepts any number of arguments!
> `action$.pipe(ofType(FIRST, SECOND, THIRD)) // FIRST or SECOND or THIRD`

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/vayoho/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>

## A Real World Example

Now that we have a general idea of what an Epic looks like, let's continue with a more real-world example:

```js
import { ajax } from 'rxjs/ajax';

// action creators
const fetchUser = username => ({ type: FETCH_USER, payload: username });
const fetchUserFulfilled = payload => ({ type: FETCH_USER_FULFILLED, payload });

// epic
const fetchUserEpic = action$ => action$.pipe(
  ofType(FETCH_USER),
  mergeMap(action =>
    ajax.getJSON(`https://api.github.com/users/${action.payload}`).pipe(
      map(response => fetchUserFulfilled(response))
    )
  )
);

// later...
dispatch(fetchUser('torvalds'));
```

> We're using action creators (aka factories) like `fetchUser` instead of creating the action POJO directly. This is a Redux convention that is totally optional.

We have a standard Redux action creator `fetchUser`, but also a corresponding Epic to orchestrate the actual AJAX call. When that AJAX call comes back, we map the response to a `FETCH_USER_FULFILLED` action.

> Remember, Epics take a stream of **actions in** and return a stream of **actions out**. If the RxJS operators and behavior shown so far is unfamiliar to you, you'll definitely want to take some time to [dive deeper into RxJS](http://reactivex.io/rxjs/) before proceeding.

You can then update your Store's state in response to that `FETCH_USER_FULFILLED` action:

```js
const users = (state = {}, action) => {
  switch (action.type) {
    case FETCH_USER_FULFILLED:
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

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/jopuza/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.40.2"></script>

## Accessing the Store's State

Your Epics receive a second argument, a stream of store states.

```js
function (action$: ActionsObservable<Action>, state$: StateObservable<State>): ActionsObservable<Action>;
```

With this, you can use `state$.value` to synchronously access the current state:

```js
const INCREMENT = 'INCREMENT';
const INCREMENT_IF_ODD = 'INCREMENT_IF_ODD';

const increment = () => ({ type: INCREMENT });
const incrementIfOdd = () => ({ type: INCREMENT_IF_ODD });

const incrementIfOddEpic = (action$, state$) => action$.pipe(
  ofType(INCREMENT_IF_ODD),
  filter(() => state$.value.counter % 2 === 1),
  map(() => increment())
);

// later...
dispatch(incrementIfOdd());
```

You can also use `withLatestFrom` for a more reactive approach:

```js
const incrementIfOddEpic = (action$, state$) => action$.pipe(
  ofType(INCREMENT_IF_ODD),
  withLatestFrom(state$),
  filter(([, state]) => state.counter % 2 === 1),
  map(() => increment())
);
```

> REMEMBER: When an Epic receives an action, it has already been run through your reducers and the state updated.

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/somuvur/embed?js,output&height=500px">View this demo on JSBinn</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>

## Combining Epics

Finally, redux-observable provides a utility called [`combineEpics()`](../api/combineEpics.md) that allows you to easily combine multiple Epics into a single one:

```js
import { combineEpics } from 'redux-observable';

const rootEpic = combineEpics(
  pingEpic,
  fetchUserEpic
);
```

Note that this is equivalent to:

```js
import { merge } from 'rxjs/observable/merge';

const rootEpic = (action$, state$) => merge(
  pingEpic(action$, state$),
  fetchUserEpic(action$, state$)
);
```

## Next Steps

Next, we’ll explore how to [activate your Epics](SettingUpTheMiddleware.md) so they can start listening for actions.
