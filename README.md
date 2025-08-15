<img title="logo" src="logo/logo-small.gif" width="16.5%">
<img title="redux-observable" src="logo/logo-text-small.png" width="72%">

[![Discord](https://img.shields.io/discord/102860784329052160)](https://discord.gg/reactiflux)
[![build status](https://img.shields.io/travis/redux-observable/redux-observable/master.svg)](https://travis-ci.org/redux-observable/redux-observable)
[![npm version](https://img.shields.io/npm/v/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)
[![npm downloads](https://img.shields.io/npm/dm/redux-observable.svg)](https://www.npmjs.com/package/redux-observable)

[RxJS](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Compose and cancel async actions to create side effects and more.

[https://redux-observable.js.org](https://redux-observable.js.org)

> Note: this project is quite stable, but is currently in maintenance mode. Critical fixes will still be released, but for now no additional features or changes will be considered as the maintainer [@jayphelps](https://github.com/jayphelps) is not actively working on any apps that use redux-observable (or any UI apps at all, actually.) If you would like to become a maintainer, please reach out to [@jayphelps](https://github.com/jayphelps).

# redux-observable Turborepo Monorepo

This is a monorepo managed with [Turborepo](https://turbo.build/).

## Structure

- `packages/redux-observable`: The core redux-observable package
- `apps/sample-app`: A sample app demonstrating usage

## Getting Started

```sh
npm install
npm run build
npm run test
```

## Development
- Use `npm run build`, `npm run test`, and `npm run lint` at the root for all packages/apps.
- Each package/app can also be developed/tested independently.
