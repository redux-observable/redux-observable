# Troubleshooting

This is a place to share common problems and solutions to them.  

* * *

### RxJS operators are missing! e.g. TypeError: action$.ofType(...).switchMap is not a function

RxJS supports the ability to [add operators individually](https://github.com/ReactiveX/rxjs#installation-and-usage) so your bundles remain small. redux-observable honors this by having the `ActionsObservable` extend `Observable` but otherwise not adding any of the core operators to the prototype.

#### Add all operators

If you want to instead add all operators, you can import the entire library inside your entry `index.js`:

```js
import 'rxjs';
```
This will add every core RxJS operator to the `Observable` prototype.

#### Add only the operators you use

tl;dr


```js
import 'rxjs/add/operator/switchMap';
action$.ofType(...).switchMap(...);

// OR

import { switchMap } from 'rxjs/operator/switchMap';
action$.ofType(...)::switchMap(...);
```

There are several ways to do this, so we don't suggest any particular one in the docs. Check out the [RxJS documentation on this](https://github.com/ReactiveX/rxjs#installation-and-usage).

If you use the `'rxjs/add/operator/name'` technique, you may find it helpful to create a single file where you place all of these so you don't have to import the same operators repeatedly.

* * *

### TypeError: object is not observable

This almost always means somewhere you're passing an object to an RxJS operator that isn't observable-like. That means it's not an Observable, Promise, Array, doesn't support `Symbol.observable`, etc.

The following are some examples of that.

#### (action$, store) => Observable.from(store)

The store provided to your Epics is the same one provided by redux to the middleware. It is not a full version of the store, so it does not support the `Symbol.observable` interop point to allow `Observable.from(store)`. You can [learn more about this here](https://github.com/redux-observable/redux-observable/issues/56).

* * *

### TypeError: Cannot read property 'subscribe' of undefined

This almost always means you're using an operator somewhere that expects to be provided with an observable but you instead did not give it anything at all. Often, you may be passing a variable but it is unknowingly set to `undefined`, so step through a debugger to confirm.

#### Happens from `combineEpics()`

Usually this means you're not returning an observable from one or more of your Epics. Often this is just a missing `return`.

```js
const myEpic = action$ => { // MISSING EXPLICIT RETURN!
  action$.ofType(...).etc(...)
};
```

### Actions dispatched from Redux DevTools do not reach Epics

This is caused by a current limitation of Redux, but [there is a workaround available](basics/SettingUpTheMiddleware.md#redux-devtools).

* * *

## Something else doesn’t work

If you think your issue is a bug with redux-observable, [create an issue](https://github.com/redux-observable/redux-observable/issues);  

If you figure it out, [edit this document](https://github.com/redux-observable/redux-observable/edit/master/docs/Troubleshooting.md) as a courtesy to the next person having the same problem.
