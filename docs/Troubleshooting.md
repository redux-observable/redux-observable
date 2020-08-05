# Troubleshooting [![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a place to share common problems and solutions to them.

> If your problem isn't yet listed here or you need other help, please use [Stack Overflow](http://stackoverflow.com/questions/tagged/redux-observable) first with the `redux-observable` tag. If you don't receive a response after a reasonable amount of time, create an issue ticket that includes a link to your Stack Overflow question.
>
> You can also get help in our public [Gitter channel](https://gitter.im/redux-observable/redux-observable)!

* * *

## RxJS v5 (or rxjs-compat) operators are missing! e.g. `TypeError: action$.ofType(...).switchMap is not a function`

Version v1.0.0 of redux-observable requires RxJS v6, which uses [pipeable operators](https://rxjs.dev/guide/v6/pipeable-operators) instead of prototype-based methods. To aid in migration there is an [rxjs-compat layer that lets you use the old v5 APIs](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/v6/migration.md).

If you are using rxjs-compat (or using a pre-1.0 version of redux-observable) and still getting an error like this where an operator is missing, you most likely need to import the operator you're looking for. RxJS supports the ability to [add operators individually](https://github.com/ReactiveX/rxjs#installation-and-usage) so your bundles remain small.

## `TypeError: Cannot read property 'subscribe' of undefined`

This *almost always* means you're using an operator somewhere that expects to be provided with an observable but you instead did not give it anything at all. 

### Potential reasons

#### If the debugger shows `combineEpics()`,

Usually this means you're not returning an observable from one or more of your Epics. Often this is just a missing `return`.

```js
const myEpic = action$ => { // MISSING EXPLICIT RETURN!
  action$.pipe(ofType(...), etc(...))
};
```

#### `this` is set to Window

If you are organizing your epics into a class (e.g. in order to benefit from Angular 2 dependency injection), you might have made the mistake of using class methods:

```typescript
class TooFancy {
  constructor(private somethingInjected:SomethingInjected)
  checkAutoLogin(action$: Observable<IPayloadAction>) {
    console.log(this); // Is Window! when called from redux-observable
  }
}
```

follow the docs and:

```typescript
class TooFancy {
  constructor(private somethingInjected:SomethingInjected)
  // Use
  checkAutoLogin = (action$: Observable<IPayloadAction>) => {
    console.log(this); // You can access something Injected
  }
}
```

See [arrow functions from MDN](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (Arrow functions used as methods)

## It seems like your epics are not responding to actions

You might be returning the result of calling `subscribe` on an `Observable` from one of your epics.

```js
const myEpic = action$ => {
  return action$.pipe(ofType(...))
  // performing side effect with .subscribe but not returning an Observable,
  // usually don't want to do this
  .subscribe(item => console.log(item));
};
```

The problem with this is that calling `subscribe` on an `Observable` does not return another `Observable`.
All epics should return an `Observable`.
If you ran into this issue and want to learn more about it, read through this issue: https://github.com/redux-observable/redux-observable/issues/263.

If you want your epic to be "read-only", meaning you want it to perform side-effects
without producing any downstream actions, you can use the following pattern.

```js
import { ofType } from 'redux-observable';
import { map, tap, ignoreElements } from 'rxjs/operators';

const myEpic = action$ => {
  return action$.pipe(
    ofType(...),
    map(...),
    tap(item => console.log(item)),
    ignoreElements()
  );
};
```

This approach essentially returns an empty `Observable` from the epic, which does not cause any downstream actions.

## `Typescript: 'ofType' operator won't narrow to proper Observable type`

Let's say you have following action types + action creator types:

```ts
import { Action } from 'redux'

const enum ActionTypes {
  One = 'ACTION_ONE',
  Two = 'ACTION_TWO',
}
const doOne = (myStr: string): One => ({ type: ActionTypes.One, myStr })
const doTwo = (myBool: boolean): Two => ({ type: ActionTypes.Two, myBool })

interface One extends Action {
  type: ActionTypes.One
  myStr: string
}
interface Two extends Action {
  type: ActionTypes.Two
  myBool: boolean
}
type Actions = One | Two
```

When you're using `ofType` operator for filtering, returned observable won't be correctly narrowed within Type System. There is an ongoing PR about this (see [here](https://github.com/redux-observable/redux-observable/pull/459)), but the following can be used as workarounds:

### Workarounds

#### Redefine `ofType` with condition types (Typescript 2.8+)

In your custom type definitions folder (see the [tsconfig typeRoots option](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types)), you can overload `ofType` by making a file and writing to it the following: 

```typescript
// redux-observable.d.ts (this comment is not needed).

import { OperatorFunction } from "rxjs";
import { Action } from "redux";

declare module "redux-observable" {
 function ofType<T extends Action<unknown>, K extends string>(
  ...key: K[]
 ): OperatorFunction<T, Extract<T, { type: K }>>;
}
```

#### Explicity set the action

You can explicitly set the generic type our type narrows your action stream correctly:

```ts
// This will let action be `Actions` type, which is wrong
const epic = (action$: ActionsObservable<Actions>) =>
  action$.pipe(
    ofType(ActionTypes.One),
    // action is still type Actions instead of One
    map((action) => {...})
  );

// Explicitly set generics fixes the issue
const epic = (action$: ActionsObservable<Actions>) =>
  action$.pipe(
    ofType<One>(ActionTypes.One),
    // action is correctly narrowed to One
    map((action) => {...})
  );
```

* * *

## Something else doesn’t work

If you think your issue is a bug with redux-observable, [create an issue](https://github.com/redux-observable/redux-observable/issues);

If you figure it out, [edit this document](https://github.com/redux-observable/redux-observable/edit/master/docs/Troubleshooting.md) as a courtesy to the next person having the same problem.
