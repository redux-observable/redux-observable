# rx-ducks-middleware (alpha)

** WARNING: This module is purely experimental **

Creates [RxJS 5](http://github.com/ReactiveX/RxJS)-based middleware for
[Redux](http://github.com/reactjs/redux). Basically, this intercepts actions via
middleware and sends them out through an observable, and provides an observer that
can be used to send an action back along your chain of middleware on its way to
the reducer.

## Install

NOTE: This has a peer dependencies of `rxjs@5.0.*` and `redux`, which will have to be installed
as well.

```sh
npm i -S rx-ducks-middleware
```

## Usage

Below is a basic example of it how it might work in React.

```js
import { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import rxDucksMiddleware from 'rx-ducks-middleware';
import yourReducerHere from './where/ever/it/lives';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';

export default class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.rxDucks = rxDucksMiddleware((actions) =>
          actions.filter(({ type }) => type === 'SOME_ACTION')
            .switchMap((action) => makeAjaxRequest(action.data)));
        this.store = createStore(yourReducerHere, applyMiddleware(middleware));
        this.actions = actions;
        this.send = send;
    }

    componentDidMount() {
      this.rxDucks.connect();
    }

    componentWillUnmount() {
      this.rxDucks.unsubscribe();
    }

    sendAction() {
        this.store.dispatch({ type: 'SOME_ACTION', data: 'stuff here' });
    }

    render() {
        return (<button onClick={this.sendAction}>test me</button>);
    }
}
```
