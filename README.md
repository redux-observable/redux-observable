<img title="logo" src="logo/logo-small.gif" width="16.5%">
<img title="redux-observable" src="logo/logo-text-small.png" width="72%">

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![build status](https://img.shields.io/travis/reactjs/redux/master.svg)](https://travis-ci.org/redux-observable/redux-observable)
[![npm version](https://img.shields.io/npm/v/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![npm downloads](https://img.shields.io/npm/dm/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![code climate](https://codeclimate.com/github/redux-observable/redux-observable/badges/gpa.svg)](https://codeclimate.com/github/redux-observable/redux-observable)

[RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Compose and cancel async actions to create side effects and more.

## Install

This has peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed
as well. Support for RxJS v4 can temporarily be provided by [an optional adapter](https://github.com/redux-observable/redux-observable-adapter-rxjs-v4).

```sh
npm install --save redux-observable
```

**IMPORTANT:** redux-observable does not add any of the RxJS operators to the `Observable.prototype` so you will need to import the ones you use or import all of them in your entry file. [Learn more](http://redux-observable.js.org/docs/Troubleshooting.html#rxjs-operators-are-missing-eg-typeerror-actionoftypeswitchmap-is-not-a-function).

## JSBin Examples

To see redux-observable in action, here's a very simple JSBin to play around with:

* [Using Raw HTML APIs](http://jsbin.com/birogu/edit?js,output)
* [Using React](http://jsbin.com/jexomi/edit?js,output)
* [Using Angular v1](http://jsbin.com/laviti/edit?js,output)
* Using Angular v2 (TODO)
* Using Ember (TODO)

## Documentation

* [Basics](https://github.com/redux-observable/redux-observable/tree/master/docs/basics/SUMMARY.md)
  * [Epics](https://github.com/redux-observable/redux-observable/tree/master/docs/basics/Epics.md)
  * [Setting Up The Middleware](https://github.com/redux-observable/redux-observable/tree/master/docs/basics/SettingUpTheMiddleware.md)
* [Recipes](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/SUMMARY.md)
  * [Cancellation](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/Cancellation.md)
  * [Error Handling](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/ErrorHandling.md)
  * [Writing Tests](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/WritingTests.md)  
  * [Usage with UI Frameworks](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/UsageWithUIFrameworks.md)
  * [Hot Module Replacement](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/HotModuleReplacement.md)
  * [Adding New Epics Asynchronously](https://github.com/redux-observable/redux-observable/tree/master/docs/recipes/AddingNewEpicsAsynchronously.md)
* [FAQ](https://github.com/redux-observable/redux-observable/tree/master/docs/FAQ.md)
* [Troubleshooting](https://github.com/redux-observable/redux-observable/tree/master/docs/Troubleshooting.md)
* [API Reference](https://github.com/redux-observable/redux-observable/tree/master/docs/api/SUMMARY.md)
  * [createEpicMiddleware](https://github.com/redux-observable/redux-observable/tree/master/docs/api/createEpicMiddleware.md)
  * [combineEpics](https://github.com/redux-observable/redux-observable/tree/master/docs/api/combineEpics.md)
  * [EpicMiddleware](https://github.com/redux-observable/redux-observable/tree/master/docs/api/EpicMiddleware.md)
* [CHANGELOG](https://github.com/redux-observable/redux-observable/tree/master/CHANGELOG.md)

## Discuss

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Everyone is welcome on our [Gitter channel](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)!

:shipit:
