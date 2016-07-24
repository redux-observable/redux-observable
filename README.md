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

This has a peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed
as well. **It is not currently compatible with RxJS v4**

```sh
npm install --save redux-observable
```

## JSBin Examples

To see redux-observable in action, here's a very simple JSBin to play around with:

* [Using Raw HTML APIs](http://jsbin.com/vayoho/edit?js,output)
* [Using React](http://jsbin.com/jexomi/edit?js,output)
* [Using Angular v1](http://jsbin.com/laviti/edit?js,output)
* Using Angular v2 (TODO)
* Using Ember (TODO)

## Documentation

* [Basics](docs/basics/SUMMARY.md)
  * [Epics](docs/basics/Epics.md)
  * [Settings Up The Middleware](docs/basics/SettingUpTheMiddleware.md)
* [Recipes](docs/recipes/SUMMARY.md)
  * [Cancellation](docs/recipes/Cancellation.md)
  * [Error Handling](docs/recipes/ErrorHandling.md)
  * [Writing Tests](docs/recipes/WritingTests.md)  
  * [Usage with UI Frameworks](docs/recipes/UsageWithUIFrameworks.md)
  * [Hot Module Replacement](docs/recipes/HotModuleReplacement.md)
  * [Adding New Epics Asynchronously](docs/recipes/AddingNewEpicsAsynchronously.md)
* [FAQ](docs/FAQ.md)
* [Troubleshooting](docs/Troubleshooting.md)
* [API Reference](docs/api/SUMMARY.md)
  * [createEpicMiddleware](docs/api/createEpicMiddleware.md)
  * [combineEpics](docs/api/combineEpics.md)
  * [EpicMiddleware](docs/api/EpicMiddleware.md)
* [CHANGELOG](CHANGELOG.md)

## Discuss

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Everyone is welcome on our [Gitter channel](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)!

:shipit:
