# Cancellation

Cancelling some async side effects is a common requirement of Epics. While there are several ways of doing this depending on your requirements, the most common way is to have your application dispatch a cancellation action and listen for it inside your Epic.

This can be done with the [`.takeUntil()`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeUntil) RxJS operator:

```js
import { ajax } from 'rxjs/observable/dom/ajax';

const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      ajax.getJSON(`/api/users/${action.payload}`)
        .map(response => fetchUserFulfilled(response))
        .takeUntil(action$.ofType(FETCH_USER_CANCELLED))
    );
```

Here we placed the `.takeUntil()` inside our [`.mergeMap()`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap), but after our AJAX call; this is important because we want to cancel only the AJAX request, not stop the Epic from listening for any future actions. Isolating your observable chains like this is an important concept you will use often. If this isn't clear, you should consider spending some time getting intimately familiar with RxJS and generally how operator chaining works. Ben Lesh [has a great video that explains how Observables work](https://www.youtube.com/watch?v=3LKMwkuK0ZE) and even covers isolating your chains!

> This example uses `mergeMap` (aka `flatMap`), which means it allows multiple concurrent `FETCH_USER` requests. If you instead want to **cancel** any pending request and instead switch to the latest one, you can use the [`switchMap`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap) operator.

***

### Try It Live!

<a class="jsbin-embed" href="https://jsbin.com/fivaca/embed?js,output&height=500px">View this demo on JSBin</a><script src="https://static.jsbin.com/js/embed.min.js?3.37.0"></script>


## Cancel and do something else (e.g. emit a different action)

Sometimes you want to cancel some side effect (like an AJAX call) but _also_ do something else, like emit a totally different action.

You can achieve that using the aptly named [`race`](reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-race) operator. It allows you to literally "race" between streams; whichever one emits a value first, wins! The losing streams are unsubscribed, cancelling anything they were doing.

Say we that when someone dispatches `FETCH_USER` we make an AJAX call, but if someone dispatches `FETCH_USER_CANCELLED` we cancel that pending AJAX request and instead emit a totally different action to increment some counter:

```js
import { ajax } from 'rxjs/observable/dom/ajax';

const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      ajax.getJSON(`/api/users/${action.payload}`)
        .map(response => fetchUserFulfilled(response))
        .race(
          action$.ofType(FETCH_USER_CANCELLED)
            .map(() => incrementCounter())
            .take(1)
        )
    );
```

We also need to use `.take(1)`, because we only want to listen for the cancellation action once, while we're racing the AJAX call.

> This is very powerful, but remember to ask yourself if, instead of dispatching a different action, could the original cancellation action be used by your reducers already in an idiomatic way? i.e. is it more clean to rely on a single action or have two unrelated ones to show better intent. Cases vary.
