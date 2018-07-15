# Cancellation

Cancelling some async side effects is a common requirement of Epics. While there are several ways of doing this depending on your requirements, the most common way is to have your application dispatch a cancellation action and listen for it inside your Epic.

This can be done with the [`takeUntil()`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeUntil) RxJS operator:

```js
import { ajax } from 'rxjs/ajax';

const fetchUserEpic = action$ => action$.pipe(
  ofType(FETCH_USER),
  mergeMap(action => ajax.getJSON(`/api/users/${action.payload}`).pipe(
    map(response => fetchUserFulfilled(response)),
    takeUntil(action$.pipe(
      ofType(FETCH_USER_CANCELLED)
    ))
  ))
);
```

Here we placed the `takeUntil()` inside our [`mergeMap()`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap), but after our AJAX call; this is important because we want to cancel only the AJAX request, not stop the Epic from listening for any future actions. Isolating your observable chains like this is an important concept you will use often. If this isn't clear, you should consider spending some time getting intimately familiar with RxJS and generally how operator chaining works. Ben Lesh [has a great video that explains how Observables work](https://www.youtube.com/watch?v=3LKMwkuK0ZE) and even covers isolating your chains!

> This example uses `mergeMap` (aka `flatMap`), which means it allows multiple concurrent `FETCH_USER` requests. If you instead want to **cancel** any pending request and instead switch to the latest one, you can use the [`switchMap`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap) operator.

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/fivaca/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>


## Cancel and Do Something Else (Emit a Different Action)

Sometimes you want to not only cancel a side effect (such as an AJAX call), _but also_ do something else, like emit a totally different action.

You can achieve that using the aptly named [`race`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-race) operator. It allows you to literally "race" between streams; whichever one emits a value first wins! The losing streams are unsubscribed, cancelling any operation they were performing.

For example, let's say that we make an AJAX call when someone dispatches `FETCH_USER`, but if someone dispatches `FETCH_USER_CANCELLED` we cancel that pending AJAX request and instead emit a totally different action - in this case, to increment a counter:

```js
import { ajax } from 'rxjs/ajax';

const fetchUserEpic = action$ => action$.pipe(
  ofType(FETCH_USER),
  mergeMap(action => race(
    ajax.getJSON(`/api/users/${action.payload}`).pipe(
      map(response => fetchUserFulfilled(response))
    ),
    action$.pipe(
      ofType(FETCH_USER_CANCELLED),
      map(() => incrementCounter()),
      take(1)
    )
  ))
);
```

We also need to use `take(1)`, because we only want to listen for the cancellation action _once_ while we're racing the AJAX call.

> This brings up a worthwhile consideration: instead of following up on the cancellation event with a separate action, could you just idiomatically repurpose the original cancellation action being absorbed by your reducers? In other words, is it better to rely on a single action that triggers both the cancellation itself, and what happens afterward, or to define two unrelated actions that reflect your intent? Optimal use cases vary from one implementation to another.
