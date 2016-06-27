# FAQ

> Because redux-observable usage heavily depends on RxJS, most of your questions will likely be RxJS questions not specific to redux-observable itself. We strongly encourage you to seek help for these from the RxJS community at large.
> 
> If your redux-observable question isn't yet listed here, please [use Stack Overflow](http://stackoverflow.com/questions/tagged/redux) first. If you don't receive a response after a reasonable amount of time, create an issue ticket that includes a link to your Stack Overflow question.

## Table of Contents

- **General**
  - [Does this work with RxJS 4/most.js/bacon.js?](#general-rxjs-v4)
  - [Why were thunkservables deprecated?](#general-thunkservables-deprecated)

## General

<a id="general-rxjs-v4"></a>
### Does this work with RxJS 4/most.js/bacon.js? 

##### RxJS v4

Not out of box. We'd love to provide an elegant for solution for this soon, ideally [RxJS v4 would add interop with `Symbol.observable`](https://github.com/Reactive-Extensions/RxJS/issues/1225).

##### most.js

We believe so, but this is currently unconfirmed! (please let us know) [most.js supports interop](https://github.com/cujojs/most/blob/master/docs/api.md#draft-es-observable-interop) with the proposed ECMAScript Observable spec which RxJS builds on top of.

##### bacon.js

Not out of box. Some work has been done to make [bacon.js support](https://github.com/baconjs/bacon.js/issues/633) the `Symbol.observable` interop point.

<a id="miscellaneous-thunkservables-deprecated"></a>
### Why were thunkservables deprecated? 

In the original implementations of redux-observable Actions Observables were known as thunkservables because you would dispatch them, just like [redux-thunk](https://github.com/gaearon/redux-thunk). While this requires slightly less boilerplate, we found in practice it to be too inflexible when dealing with use-cases like auto-suggest/debouncing/cancellation and didn't encourage a consistent dataflow. Because we don't want to confuse people with two options that in many use cases are functionally equivalent, we decided to eventually remove thunkservables completely. We do not yet have an official date when support will be removed, but it likely will be before or at v1.0 release.