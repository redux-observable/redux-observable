<img title="logo" src="logo/logo-small.gif" width="16.5%">
<img title="redux-observable" src="logo/logo-text-small.png" width="72%">

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![build status](https://img.shields.io/travis/redux-observable/redux-observable/master.svg)](https://travis-ci.org/redux-observable/redux-observable)
[![npm version](https://img.shields.io/npm/v/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![npm downloads](https://img.shields.io/npm/dm/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)

[RxJS](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Compose and cancel async actions to create side effects and more.

[https://redux-observable.js.org](https://redux-observable.js.org)

> Note: this project is quite stable, and although a new version (2.0.0) has been recently released, the project remains in maintenance mode. Critical fixes will still be released, but for now no additional features or changes will be considered as the maintainer [@jayphelps](https://github.com/jayphelps) is not actively working on any apps that use redux-observable (or any UI apps at all, actually.) If you would like to become a maintainer, please reach out to [@jayphelps](https://github.com/jayphelps).

## Install

This project has a peer dependency of `redux@4.x.x`, which will have to be installed as well. 

```bash
npm install --save redux-observable
```

### RxJS version compatibility

Current stable version `redux-observable@2.0.0` is compatible with `rxjs@7.0.0`.  If your project is using `rxjs@6.x.x`, and you cannot upgrade, we recommend downgrading to (`redux-observable@1.x.x`).

##### UMD

We publish a UMD build inside our npm package. You can use it via the [unpkg](https://unpkg.com/) CDN:

[https://unpkg.com/redux-observable@latest/dist/redux-observable.min.js](https://unpkg.com/redux-observable@latest/dist/redux-observable.min.js)

## Watch an introduction

[![Watch a video on redux-observable](http://img.youtube.com/vi/AslncyG8whg/0.jpg)](https://www.youtube.com/watch?v=AslncyG8whg)

## Documentation

### [https://redux-observable.js.org](https://redux-observable.js.org)

## Discuss

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Everyone is welcome on our [Gitter channel](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)!

## Custom Emoji

##### Save this:

<img src="https://cloud.githubusercontent.com/assets/762949/18562188/905876f6-7b37-11e6-8677-f9dd091490f6.gif" width="22" height="22" />

Add the redux-observable spinning logo to your Slack channel! [Slack Instructions](https://get.slack.help/hc/en-us/articles/206870177-Create-custom-emoji)

***

*redux-observable is a community-driven, entirely volunteer project and is not officially affiliated with or sponsored by any company.

:shipit:
