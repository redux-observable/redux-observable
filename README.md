<img title="logo" src="logo/logo-small.gif" width="16.5%">
<img title="redux-observable" src="logo/logo-text-small.png" width="72%">

[![Join the chat at https://gitter.im/redux-observable/redux-observable](https://badges.gitter.im/redux-observable/redux-observable.svg)](https://gitter.im/redux-observable/redux-observable?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![build status](https://img.shields.io/travis/reactjs/redux/master.svg)](https://travis-ci.org/redux-observable/redux-observable)
[![npm version](https://img.shields.io/npm/v/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![npm downloads](https://img.shields.io/npm/dm/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![code climate](https://codeclimate.com/github/redux-observable/redux-observable/badges/gpa.svg)](https://codeclimate.com/github/redux-observable/redux-observable)

[RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Compose and cancel async actions to create side effects and more.

[https://redux-observable.js.org](https://redux-observable.js.org)

## Install

This has peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed as well.

```bash
npm install --save redux-observable
```

**IMPORTANT:** redux-observable does not add any of the RxJS operators to the `Observable.prototype` so you will need to import the ones you use or import all of them in your entry file. [Learn more](http://redux-observable.js.org/docs/Troubleshooting.html#rxjs-operators-are-missing-eg-typeerror-actionoftypeswitchmap-is-not-a-function).

##### Adapters

You can use other stream libraries (other than RxJS v5) by using an Adapter.

* [RxJS v4](https://github.com/redux-observable/redux-observable-adapter-rxjs-v4)
* [most.js](https://github.com/redux-observable/redux-observable-adapter-most)

You can write your own adapter too:

```js
const adapter = {
  input: input$ => /* convert Observable to your preferred stream library */,
  output: output$ => /* convert your preferred stream back to an Observable */
};
```

See the existing adapters for examples. Keep in mind that while you still need RxJS v5 installed, redux-observable only pulls in the minimum amount of RxJS it needs internally--it doesn't import _all_ of RxJS. 

##### UMD

We publish a UMD build inside our npm package. You can use it via the [unpkg](https://unpkg.com/) CDN:

[https://unpkg.com/redux-observable@latest/dist/redux-observable.min.js](https://unpkg.com/redux-observable@latest/dist/redux-observable.min.js)

## Watch an introduction

[![Watch a video on redux-observable](http://img.youtube.com/vi/AslncyG8whg/0.jpg)](https://www.youtube.com/watch?v=AslncyG8whg)

## JSBin Examples

To see redux-observable in action, here's a very simple JSBin to play around with:

* [Using Raw HTML APIs](http://jsbin.com/birogu/edit?js,output)
* [Using React](http://jsbin.com/jexomi/edit?js,output)
* [Using Angular v1](http://jsbin.com/laviti/edit?js,output)
* Using Angular v2 (TODO)
* Using Ember (TODO)

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

:shipit:
