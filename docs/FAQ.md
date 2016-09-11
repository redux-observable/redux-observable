# FAQ

> Because redux-observable usage heavily depends on RxJS, most of your questions will likely be RxJS questions not specific to redux-observable itself. We strongly encourage you to seek help for these from the RxJS community at large.
> 
> If your redux-observable question isn't yet listed here, please [use Stack Overflow](http://stackoverflow.com/questions/tagged/redux-observable) first. If you don't receive a response after a reasonable amount of time, create an issue ticket that includes a link to your Stack Overflow question.

## Table of Contents

- **General**
  - [Does this work with RxJS 4/most.js/bacon.js?](#general-rxjs-v4)
  - [Why were thunkservables deprecated?](#general-thunkservables-deprecated)

## General

<a id="general-rxjs-v4"></a>
### Does this work with RxJS 4/most.js/bacon.js/etc? 

##### RxJS v4

Not out of box, but we provide an adapter [redux-observable-adapter-rxjs-v4](https://github.com/redux-observable/redux-observable-adapter-rxjs-v4) you can install to add support temporarily while you transition to RxJS v5. Please upgrade to v5 as soon as possible as we do not plan to support this long-term.

##### most.js
##### bacon.js
##### etc.

It should be possible for you to create an adapter to add support. See [redux-observable-adapter-rxjs-v4](https://github.com/redux-observable/redux-observable-adapter-rxjs-v4) for reference.

<a id="miscellaneous-thunkservables-deprecated"></a>
<a id="why-were-thunkservables-removed"></a>
### Why were thunkservables removed?

In the original implementations of redux-observable [Epics](basics/Epics.md) were known as thunkservables because you would dispatch them, just like [redux-thunk](https://github.com/gaearon/redux-thunk). While this requires slightly less boilerplate, we found in practice it to be too inflexible when dealing with use-cases like auto-suggest/debouncing/cancellation and didn't encourage a consistent dataflow. Because we don't want to confuse people with two options that in many use cases are functionally equivalent, we decided to remove thunkservables completely. Check out the documentation on [Epics](basics/Epics.md) on how to start using them.

As a bonus, you can now easily use [redux-thunk](https://github.com/gaearon/redux-thunk) (or other thunk-like middleware) along side redux-observable! So if you'd like, you can use redux-thunk for most of your simple async and then defer to redux-observable for the more complex tasks; or to ease migration.
